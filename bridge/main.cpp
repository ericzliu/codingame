#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <memory>
#include <sstream>

using namespace std;

class Road {
public:
    vector< vector< char > > lanes;
    int height;
    int width;

    Road(vector<string> & strs) {
        this->height = 4;
        int width = 0;
        for (; (strs[0][width] == '0' || strs[0][width] == '.') && width < strs[0].size(); ++width) {
        }
        this->width = width;
        lanes = vector< vector< char > > (4, vector< char > (width));
        for (int i = 0; i < height; ++i) {
            string & str = strs[i];
            for (int j = 0; j < width; ++j) {
                lanes[i][j] = str[j];
            }
        }
    }

    bool is_hole(int x, int y) {
        if (x < this->width && y < this->height)
            return lanes[y][x] != '.';
        else {
            return false;
        }
    }

    int count_hole(int min_x, int max_x, int y) {
        auto num = 0;
        for (auto i = min_x; i <= max_x; i ++) {
            if (is_hole(i, y)) {
                num ++;
            }
        }
        return num;
    }

    string to_string() {
        ostringstream str;
        bool isFirst = true;
        for (auto i = 0; i < height; i += 1) {
            if (isFirst) {
                isFirst = false;
            } else {
                str << '\n';
            }
            for (auto j = 0; j < width; j += 1) {
                str << lanes[i][j];
            }
        }
        return str.str();
    }
};

struct Command {
    static constexpr const char* JUMP = "JUMP";
    static constexpr const char* SPEED = "SPEED";
    static constexpr const char* WAIT = "WAIT";
    static constexpr const char* SLOW = "SLOW";
    static constexpr const char* UP = "UP";
    static constexpr const char* DOWN = "DOWN";
};

struct Motor {
    int x;
    int y;
    bool activated;
    Motor() {
        x = 0;
        y = 0;
        activated = false;
    }

    Motor change_x(int x) {
        Motor after = *this;
        after.x = x;
        return after;
    }

    Motor change_y(int y) {
        Motor after = *this;
        after.y = y;
        return after;
    }

    string to_string() {
        ostringstream ostr;
        ostr << "{";
        ostr << "x:";
        ostr << x;
        ostr << ",y:";
        ostr << y;
        ostr << ",activated:";
        ostr << activated;
        ostr << "}";
        return ostr.str();
    }
};

struct State {
    int speed;
    vector<Motor> motors;
    State() {
        speed = 0;
    }

    string to_string() {
        ostringstream ostr;
        ostr << "{";
        ostr << "speed:";
        ostr << speed;
        ostr << ",motors:[";
        for (auto& motor : motors) {
            ostr << motor.to_string();
            ostr << ",";
        }
        ostr << "]}";
        return ostr.str();
    }
};

typedef shared_ptr<State> StateRef;

StateRef state_ref() {
    return make_shared<State>();
}

struct Node;

typedef shared_ptr<Node> NodeRef;

struct Node {
    StateRef state;
    const char* cmd;
    NodeRef parent;

    Node() {
        cmd = nullptr;
    }

    string to_string() {
        ostringstream ostr;
        ostr << "{";
        ostr << "state:";
        ostr << state->to_string();
        ostr << ",cmd:";
        if (cmd != nullptr) {
            ostr << cmd;
        } else {
            ostr << "none";
        }
        ostr << "}";
        return ostr.str();
    }
};

NodeRef node_ref() {
    return make_shared<Node>();
}

NodeRef root_node(StateRef& state) {
    auto root = make_shared<Node>();
    root->state = state;
    return root;
}

bool is_root_node(NodeRef& node) {
    return node->parent.get() == nullptr;
}

struct BaseCommand {

    int min_live;
    Road* road;

    BaseCommand() {
        min_live = 0;
        road = nullptr;
    }

    Road& get_road() {
        return *road;
    }

    bool test(NodeRef & parent) {
        auto & motors = parent->state->motors;
        auto speed = apply(parent->state->speed);
        if (speed == 0)
            return false;
        auto num_live = 0;
        for (auto & motor: motors) {
            if (this->test(speed, motor)) {
                num_live++;
            }
        }
        return num_live >= min_live;
    }

    NodeRef apply(NodeRef & parent) {
        auto & motors = parent->state->motors;
        auto state = state_ref();
        state->speed = apply(parent->state->speed);
        for (auto & motor: motors) {
            if (motor.activated) {
                auto after = this->apply(state->speed, motor);
                if (after.activated) {
                    state->motors.push_back(after);
                }
            }
        }
        auto node = node_ref();
        node->state = state;
        node->cmd = label();
        node->parent = parent;
        return node;
    }

    virtual bool feasible(NodeRef& node) {
        return true;
    }

    virtual Motor apply(int speed, Motor& motor) = 0;
    virtual bool test(int speed, Motor& motor) = 0;
    virtual int apply(int speed) = 0;
    virtual const char* label() = 0;
    virtual ~BaseCommand() {}

};

typedef unique_ptr<BaseCommand> BaseCommandRef;

class Jump : public BaseCommand {

    virtual Motor apply(int speed, Motor& motor) {
        return motor.change_x(motor.x + speed);
    }

    virtual bool test(int speed, Motor& motor) {
        return !(get_road().is_hole(motor.x + speed, motor.y));
    }

    virtual int apply(int speed) {
        return speed;
    }

    virtual const char* label() {
        return Command::JUMP;
    }
};

class Speed : public BaseCommand {
    virtual Motor apply(int speed, Motor& motor) {
        return motor.change_x(motor.x + speed);
    }

    virtual bool test(int speed, Motor& motor) {
        return get_road().count_hole(motor.x + 1, motor.x + speed, motor.y) == 0;
    }

    virtual int apply(int speed) {
        return (speed + 1) >= 50? speed : (speed + 1);
    }

    virtual const char* label() {
        return Command::SPEED;
    }
};

class Slow : public BaseCommand {
    virtual Motor apply(int speed, Motor& motor) {
        return motor.change_x(motor.x + speed);
    }

    virtual bool test(int speed, Motor& motor) {
        return get_road().count_hole(motor.x + 1, motor.x + speed, motor.y) == 0;
    }

    virtual int apply(int speed) {
        return (speed - 1) < 0? speed : (speed - 1);
    }

    virtual const char* label() {
        return Command::SLOW;
    }
};

class Wait : public BaseCommand {
    virtual Motor apply(int speed, Motor& motor) {
        return motor.change_x(motor.x + speed);
    }

    virtual bool test(int speed, Motor& motor) {
        return get_road().count_hole(motor.x + 1, motor.x + speed, motor.y) == 0;
    }

    virtual int apply(int speed) {
        return speed;
    }

    virtual const char* label() {
        return Command::WAIT;
    }
};

class Up : public BaseCommand {
    virtual Motor apply(int speed, Motor& motor) {
        return motor.change_y(motor.y - 1);
    }

    virtual bool test(int speed, Motor& motor) {
        auto dest_x = motor.x + speed;
        auto curr = motor.y;
        auto next = curr - 1;
        return get_road().count_hole(motor.x + 1, dest_x - 1, curr) == 0 && get_road().count_hole(motor.x + 1, dest_x, next) == 0;
    }

    virtual int apply(int speed) {
        return speed;
    }

    virtual const char* label() {
        return Command::UP;
    }

    virtual bool feasible(NodeRef& node) {
        auto & motors = node->state->motors;
        for (auto & motor : motors) {
            if (motor.activated && motor.y == 0) {
                return false;
            }
        }
        return true;
    }
};

class Down : public BaseCommand {
    virtual Motor apply(int speed, Motor& motor) {
        return motor.change_y(motor.y + 1);
    }

    virtual bool test(int speed, Motor& motor) {
        auto dest_x = motor.x + speed;
        auto curr = motor.y;
        auto next = curr + 1;
        return get_road().count_hole(motor.x + 1, dest_x - 1, curr) == 0 && get_road().count_hole(motor.x + 1, dest_x, next) == 0;
    }

    virtual int apply(int speed) {
        return speed;
    }

    virtual const char* label() {
        return Command::DOWN;
    }

    virtual bool feasible(NodeRef& node) {
        auto & motors = node->state->motors;
        for (auto & motor : motors) {
            if (motor.activated && motor.y == (get_road().height - 1)) {
                return false;
            }
        }
        return true;
    }
};

BaseCommandRef jump() {
    return unique_ptr<BaseCommand>(new Jump());
}

BaseCommandRef slow() {
    return unique_ptr<BaseCommand>(new Slow());
}

BaseCommandRef wait() {
    return unique_ptr<BaseCommand>(new Wait());
}

BaseCommandRef down() {
    return unique_ptr<BaseCommand>(new Down());
}

BaseCommandRef up() {
    return unique_ptr<BaseCommand>(new Up());
}

struct Simulator {

    vector< BaseCommandRef > commands;
    vector< NodeRef > get_children(NodeRef & parent) {
        vector< NodeRef > children;
        for (auto& command : commands) {
            if (command->feasible(parent)) {
                auto speed_post = command->apply(parent->state->speed);
                if (command->test(parent)) {
                    auto child = command->apply(parent);
                    children.push_back(child);
                }
            }
        }
        return children;
    }

    string to_decisions_debug_info(NodeRef node) {
        ostringstream ostr;
        bool first = true;
        while (!is_root_node(node)) {
            if (first) {
                first = false;
            } else {
                ostr << "<--";
            }
            ostr << node->to_string();
        }

        if (first) {
            first = false;
        } else {
            ostr << "<--";
        }
        ostr << node->to_string();
        return ostr.str();
    }
};

/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/
int main()
{
    int M; // the amount of motorbikes to control
    cin >> M; cin.ignore();
    int V; // the minimum amount of motorbikes that must survive
    cin >> V; cin.ignore();
    string L0; // L0 to L3 are lanes of the road. A dot character . represents a safe space, a zero 0 represents a hole in the road.
    cin >> L0; cin.ignore();
    string L1;
    cin >> L1; cin.ignore();
    string L2;
    cin >> L2; cin.ignore();
    string L3;
    cin >> L3; cin.ignore();

    // game loop
    while (1) {
        int S; // the motorbikes' speed
        cin >> S; cin.ignore();
        for (int i = 0; i < M; i++) {
            int X; // x coordinate of the motorbike
            int Y; // y coordinate of the motorbike
            int A; // indicates whether the motorbike is activated "1" or detroyed "0"
            cin >> X >> Y >> A; cin.ignore();
        }

        // Write an action using cout. DON'T FORGET THE "<< endl"
        // To debug: cerr << "Debug messages..." << endl;


        // A single line containing one of 6 keywords: SPEED, SLOW, JUMP, WAIT, UP, DOWN.
        cout << "SPEED" << endl;
    }
}
