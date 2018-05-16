#include <iostream>
#include <vector>
#include <string>
#include <memory>
#include <algorithm>
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
        return "";
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

    Road(vector<string> & strs) {
        int height = 4;
        int width = 0;
        for (; (strs[0][width] == '0' || strs[0][width] == '.') && width < strs[0].size(); ++width) {
        }
        lanes = vector< vector< char > > (4, vector< char > (width));
        for (int i = 0; i < height; ++i) {
            string & str = strs[i];
            for (int j = 0; j < width; ++j) {
                lanes[i][j] = str[j];
            }
        }
    }

    bool isHole(int x, int y) {
        return lanes[y][x] == '0';
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
            nState->motors.push_back(Motor(x, y, live));
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
            nState->motors.push_back(Motor(x, y, live));
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
            nState->motors.push_back(Motor(x, y, live));
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
            nState->motors.push_back(Motor(x, y, live));
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
            nState->motors.push_back(Motor(x, y, live));
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
            nState->motors.push_back(Motor(x, y, live));
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
            if (nNode->state->motors.size() >= min) {
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
        if (level >= max_level) {
            /**
              * Only used when max_level is set to <= 0
              */
            return ans;
        }
        auto states = this->commands->move(current);
        for (auto state: states) {
            if (level == max_level) {
                ans.push_back(state);
            } else {
                auto child_ans = search(state, level + 1);
                copy(begin(child_ans), end(child_ans), back_inserter(ans));
            }
        }
        return ans;
    }
};

namespace Judge
{
double score(State& state) {
    /**
      * There are two factors: number of live motors and speed
      */
    auto n_live = count_if(begin(state.motors), end(state.motors), [](Motor& motor) { return motor.live; });
    return n_live;
}

vector< shared_ptr< Node > > max_nodes(vector< shared_ptr< Node > >& nodes) {
    vector< shared_ptr< Node > > ans;
    double max_score = 0.0;
    for (auto node: nodes) {
        auto note = score(*(node->state));
        if (note > max_score) {
            max_score = note;
            ans.clear();
            ans.push_back(node);
        } else if (note == max_score) {
            ans.push_back(node);
        }
    }
    return ans;
}

COMMAND get_first_command(shared_ptr<Node> & node) {
    COMMAND cmd = NA;
    while (node->cmd != NA) {
        cmd = node->cmd;
        node = node->parent;
    }
    return cmd;
}

COMMAND get_best_command(vector< shared_ptr< Node > >& nodes) {
    vector<int> counters(7, 0);
    for (auto& node : nodes) {
        counters[get_first_command(node)]++;
    }
    auto m = max_element(begin(counters), end(counters));
    auto index = distance(begin(counters), m);
    index;
}

COMMAND select(vector< shared_ptr< Node > >& nodes) {
    auto m_nodes = max_nodes(nodes);
    return get_best_command(m_nodes);
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
            state->motors.push_back(Motor(X, Y, A == '1'));
        }
        auto node = make_shared<Node>(state);
        auto nodes = simulator.search(node, 3);
        COMMAND cmd = Judge::select(nodes);
        // Write an action using cout. DON'T FORGET THE "<< endl"
        // To debug: cerr << "Debug messages..." << endl;


        // A single line containing one of 6 keywords: SPEED, SLOW, JUMP, WAIT, UP, DOWN.
        cout << to_string(cmd) << endl;
    }
}
