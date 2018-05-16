#include <iostream>
#include <vector>
#include <string>
#include <memory>
#include <algorithm>
#include <sstream>
using namespace std;

enum COMMAND {
    NA,
    SPEED,
    SLOW,
    JUMP,
    WAIT,
    UP,
    DOWN
};

string to_string(COMMAND cmd) {
    switch (cmd) {
    case SPEED:
        return "SPEED";
    case SLOW:
        return "SLOW";
    case JUMP:
        return "JUMP";
    case WAIT:
        return "WAIT";
    case UP:
        return "UP";
    case DOWN:
        return "DOWN";
    default:
        return "NA";
    }
}

namespace Speed {
int inc(int speed) {
    ++speed;
    if (speed >= 50) {
        return 49;
    }
    return speed;
}

int dec(int speed) {
    --speed;
    if (speed <0) {
        return 0;
    }
    return speed;
}
}

namespace Vertical {
int up(int y) {
    --y;
    if (y < 0) {
        return 0;
    }
    return y;
}

int down(int y) {
    ++y;
    if (y > 3) {
        return 3;
    }
    return y;
}
}

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

    bool isHole(int x, int y) {
        if (x < this->width && y < this->height)
            return lanes[y][x] != '.';
        else {
            return false;
        }
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

class Motor {
public:
    int x;
    int y;
    bool live;

    Motor(int x, int y, bool live) {
        this->x = x;
        this->y = y;
        this->live = live;
    }

};

class State {
public:
    int speed;
    vector< Motor > motors;
    State() {
        this->speed = 0;
    }
    
    int count_live() {
        return count_if(begin(motors), end(motors), [](Motor & motor) -> bool { return motor.live; });
    }
    
    string to_string() {
        ostringstream str;
        str << "state: {";
        str << "speed:";
        str << speed;
        str << ',';
        str << "motors:";
        str << '[';
        for (auto & motor : motors) {
            str << '(' << motor.x << ',' << motor.y << ',';
            str << ((motor.live == true) ? "true": "false") << "),";
        }
        str << "]}";
        return str.str();
    }

};

class Node {
public:
    Node(shared_ptr<State>& state, COMMAND cmd, shared_ptr<Node>& parent) {
        this->state = state;
        this->cmd = cmd;
        this->parent = parent;
    }

    Node(shared_ptr<State>& state) {
        this->state = state;
        this->cmd = NA;
    }

    COMMAND cmd;
    shared_ptr<State> state;
    shared_ptr<Node> parent;
};

class Command {
public:
    Road* road;
    void init(Road* road) {
        this->road = road;
    }

    virtual shared_ptr<Node> move(shared_ptr<Node> & state) = 0;

    virtual ~Command() {}
};

class SpeedCmd : public Command {
public:
    COMMAND cmd = SPEED;
    shared_ptr<Node> move(shared_ptr<Node> & node) {
        auto & state = *(node->state);
        auto nState = make_shared<State>();
        auto nSpeed = Speed::inc(state.speed);
        nState->speed = nSpeed;
        for (auto && motor : state.motors) {
            int x = motor.x + nSpeed;
            int y = motor.y;
            bool live = motor.live;
            if (live) {
                for (auto w = motor.x + 1; w <= x; w += 1) {
                    if (road->isHole(w, y)) {
                        live = false;
                    }
                }
            }
            if (live) {
                nState->motors.push_back(Motor(x, y, live));
            }
        }
        return make_shared<Node>(nState, this->cmd, node);
    }
};

class SlowCmd : public Command {
public:
    COMMAND cmd = SLOW;
    shared_ptr<Node> move(shared_ptr<Node> & node) {
        auto & state = *(node->state);
        auto nState = make_shared<State>();
        auto nSpeed = Speed::dec(state.speed);
        nState->speed = nSpeed;
        for (auto && motor : state.motors) {
            int x = motor.x + nSpeed;
            int y = motor.y;
            bool live = motor.live;
            if (live) {
                for (auto w = motor.x + 1; w <= x; w += 1) {
                    if (road->isHole(w, y)) {
                        live = false;
                    }
                }
            }
            
            if (live) {
                nState->motors.push_back(Motor(x, y, live));
            }
        }
        return make_shared<Node>(nState, this->cmd, node);
    }
};

class JumpCmd : public Command {
public:
    COMMAND cmd = JUMP;
    shared_ptr<Node> move(shared_ptr<Node> & node) {
        auto & state = *(node->state);
        auto nState = make_shared<State>();
        auto nSpeed = Speed::dec(state.speed);
        nState->speed = nSpeed;
        for (auto && motor : state.motors) {
            int x = motor.x + nSpeed;
            int y = motor.y;
            bool live = motor.live;
            if (live) {
                if (road->isHole(x, y)) {
                    live = false;
                }
            }
            if (live) {
                nState->motors.push_back(Motor(x, y, live));
            }
        }
        return make_shared<Node>(nState, this->cmd, node);
    }
};

class WaitCmd : public Command {
public:
    COMMAND cmd = WAIT;
    shared_ptr<Node> move(shared_ptr<Node> & node) {
        auto & state = *(node->state);
        auto nState = make_shared<State>();
        nState->speed = state.speed;
        for (auto && motor : state.motors) {
            int x = motor.x + nState->speed;
            int y = motor.y;
            bool live = motor.live;
            if (live) {
                for (auto w = motor.x + 1; w <= x; w += 1) {
                    if (road->isHole(w, y)) {
                        live = false;
                    }
                }
            }
            if (live) {
                nState->motors.push_back(Motor(x, y, live));
            }
        }
        return make_shared<Node>(nState, this->cmd, node);
    }
};

class UpCmd : public Command {
public:
    COMMAND cmd = UP;
    shared_ptr<Node> move(shared_ptr<Node> & node) {
        auto & state = *(node->state);
        auto nState = make_shared<State>();
        nState->speed = state.speed;
        bool up = find_if(begin(state.motors), end(state.motors), [](Motor & motor) { return motor.y == 0; }) == end(state.motors);
        if (!up) {
            return shared_ptr<Node>();
        }
        for (auto && motor : state.motors) {
            int x = motor.x + nState->speed;
            int y = up ? Vertical::up(motor.y): motor.y;
            bool live = motor.live;
            if (live) {
                for (auto w = motor.x + 1; w <= x; w += 1) {
                    if (road->isHole(w, y)) {
                        live = false;
                    }
                }
                if (live && up) {
                    for (auto w = motor.x + 1; w < x; w += 1) {
                        if (road->isHole(w, motor.y)) {
                            live = false;
                        }
                    }
                }
            }
            if (live) {
                nState->motors.push_back(Motor(x, y, live));
            }
        }
        return make_shared<Node>(nState, this->cmd, node);
    }
};

class DownCmd : public Command {
public:
    COMMAND cmd = DOWN;
    shared_ptr<Node> move(shared_ptr<Node> & node) {
        auto & state = *(node->state);
        auto nState = make_shared<State>();
        nState->speed = state.speed;
        bool down = find_if(begin(state.motors), end(state.motors), [](Motor & motor) { return motor.y == 3; }) == end(state.motors);
        if (!down) {
            return shared_ptr<Node>();
        }
        for (auto && motor : state.motors) {
            int x = motor.x + nState->speed;
            int y = down ? Vertical::down(motor.y): motor.y;
            bool live = motor.live;
            if (live) {
                for (auto w = motor.x + 1; w <= x; w += 1) {
                    if (road->isHole(w, y)) {
                        live = false;
                    }
                }
                if (live && down) {
                    for (auto w = motor.x + 1; w < x; w += 1) {
                        if (road->isHole(w, motor.y)) {
                            live = false;
                        }
                    }
                }
            }
            if (live) {
                nState->motors.push_back(Motor(x, y, live));
            }
        }
        return make_shared<Node>(nState, this->cmd, node);
    }
};

class Commands {
public:
    vector< shared_ptr<Command> > commands;
    int min;
    Commands(Road* road, int min) {
        commands.push_back(shared_ptr<Command>(new SpeedCmd()));
        commands.push_back(shared_ptr<Command>(new SlowCmd()));
        commands.push_back(shared_ptr<Command>(new JumpCmd()));
        commands.push_back(shared_ptr<Command>(new WaitCmd()));
        commands.push_back(shared_ptr<Command>(new UpCmd()));
        commands.push_back(shared_ptr<Command>(new DownCmd()));
        for_each(begin(commands), end(commands), [road](shared_ptr<Command> cmd) { cmd->init(road); });
        this->min = min;
    }

    vector< shared_ptr<Node> > move(shared_ptr<Node> & node) {
        vector< shared_ptr<Node> > ans;
        for (auto & cmd: commands) {
            auto nNode = cmd->move(node);
            if (nNode.get() != nullptr && nNode->state->count_live() >= min && nNode->state->speed > 0) {
                ans.push_back(nNode);
            }
        }
        return ans;
    }
};


class Simulator
{
public:
    shared_ptr<Commands> commands;
    Simulator(Road* road, int min) {
        this->commands = make_shared<Commands>(road, min);
    }

    vector< shared_ptr< Node > > search(shared_ptr< Node > current, int max_level) {
        return search(current, 1, max_level);
    }

    vector< shared_ptr< Node > > search(shared_ptr< Node > current, int level, int max_level) {
        vector< shared_ptr< Node > > ans;
        auto states = this->commands->move(current);
        for (auto state: states) {
            if (level == max_level) {
                ans.push_back(state);
            } else {
                auto child_ans = search(state, level + 1, max_level);
                copy(begin(child_ans), end(child_ans), back_inserter(ans));
            }
        }
        return ans;
    }
};

namespace Judge
{
COMMAND get_first_command(shared_ptr<Node> & node) {
    COMMAND cmd = NA;
    while (node->cmd != NA) {
        cmd = node->cmd;
        node = node->parent;
    }
    return cmd;
}

COMMAND select(vector< shared_ptr< Node > >& nodes) {
    sort(begin(nodes), end(nodes), [](shared_ptr< Node >& left, shared_ptr< Node >& right) -> bool {
        State & lstate = *(left->state);
        State & rstate = *(right->state);
        if (lstate.speed < rstate.speed) {
            return true;
        } else if (lstate.speed > rstate.speed) {
            return false;
        }
        
        auto llive = lstate.count_live();
        auto rlive = rstate.count_live();
        if (llive < rlive) {
            return true;
        }
        return false;
    });
    return get_first_command(nodes[nodes.size() - 1]);
}

}

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
    vector< string > strs = { L0, L1, L2, L3 };
    Road road(strs);
    cerr << road.to_string() << endl;
    Simulator simulator(&road, V);
    // game loop
    while (1) {
        int S; // the motorbikes' speed
        cin >> S; cin.ignore();
        auto state = make_shared<State>();
        state->speed = S;
        for (int i = 0; i < M; i++) {
            int X; // x coordinate of the motorbike
            int Y; // y coordinate of the motorbike
            int A; // indicates whether the motorbike is activated "1" or detroyed "0"
            cin >> X >> Y >> A; cin.ignore();
            if (A == 1) {
                state->motors.push_back(Motor(X, Y, A == 1));
            }
        }
        cerr << state->to_string() << endl;
        auto node = make_shared<Node>(state);
        auto nodes = simulator.search(node, 5);
        COMMAND cmd = Judge::select(nodes);
        // Write an action using cout. DON'T FORGET THE "<< endl"
        // To debug: cerr << "Debug messages..." << endl;


        // A single line containing one of 6 keywords: SPEED, SLOW, JUMP, WAIT, UP, DOWN.
        cout << to_string(cmd) << endl;
    }
}
