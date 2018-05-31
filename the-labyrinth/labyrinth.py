# -*- coding: utf-8 -*-
import sys
import heapq
import math

class Node(object):

    def __init__(self, position):
        self.position = position
        self.parent = None

    def __str__(self):
        return str(self.__class__) + ": " + str(self.__dict__)
    
    def __repr__(self):
        return self.__str__()

class Maze(object):

    def __init__(self, row, col):
        self.row = row
        self.col = col
        self.dat = [['?' for c in range(self.col)] for r in range(self.row)]
        self.control_room = None
        self.starting_point = None

    def update_row(self, i, row):
        for c in range(self.col):
            char = row[c]
            if char != '?':
                self.dat[i][c] = char
                if self.is_control_room((i, c)):
                    self.control_room = (i, c)
                elif self.is_starting_point((i, c)):
                    self.starting_point = (i, c)

    def __str__(self):
        return '\n'.join([''.join(self.dat[r]) for r in range(self.row)])
    
    def __repr__(self):
        return self.__str__()
        
    def is_wall(self, pos):
        return self.dat[pos[0]][pos[1]] == '#'
    
    def is_out(self, pos):
        return pos[0] < 0 or pos[0] >= self.row or pos[1] < 0 or pos[1] >= self.col

    def is_unknown(self, pos):
        return self.dat[pos[0]][pos[1]] == '?'

    def is_control_room(self, pos):
        return self.dat[pos[0]][pos[1]] == 'C'

    def is_starting_point(self, pos):
        return self.dat[pos[0]][pos[1]] == 'T'

    def is_control_room_seen(self):
        return not (self.control_room is None)

def is_left(src_pos, dst_pos):
    return dst_pos[0] == src_pos[0] and dst_pos[1] == src_pos[1] - 1

def is_right(src_pos, dst_pos):
    return dst_pos[0] == src_pos[0] and dst_pos[1] == src_pos[1] + 1

def is_up(src_pos, dst_pos):
    return src_pos[0] - 1 == dst_pos[0] and dst_pos[1] == src_pos[1]

def is_down(src_pos, dst_pos):
    return src_pos[0] + 1 == dst_pos[0] and dst_pos[1] == src_pos[1]

def get_direction(src_pos, dst_pos):
    if is_left(src_pos, dst_pos):
        return 'LEFT'
    elif is_right(src_pos, dst_pos):
        return 'RIGHT'
    elif is_up(src_pos, dst_pos):
        return 'UP'
    elif is_down(src_pos, dst_pos):
        return 'DOWN'
    else:
        raise Exception('Wrong direction')

def all_neighbors(pos, maze, visted_set):
    kr = pos[0]
    kc = pos[1]
    all_pos = [(kr - 1, kc), (kr + 1, kc), (kr, kc + 1), (kr, kc - 1)]
    return [p for p in all_pos if not(p in visted_set) and not(maze.is_out(p)) and not(maze.is_wall(p)) and not(maze.is_unknown(p))]

# row, col, f, g, h, parent
    
class Elt(object):
    
    def __init__(self, row, col):
        self.row = row
        self.col = col
        self.f = math.inf
        self.g = math.inf
        self.h = math.inf
        self.parent = None
        
    def __eq__(self, other):
        return (self.f, self.g, self.h, self.row, self.col) == (other.f, other.g, other.h, other.row, other.col)

    def __lt__(self, other):
        return (self.f, self.g, self.h, self.row, self.col) < (other.f, other.g, other.h, other.row, other.col)
        
    @property
    def g(self):
        return self.__g
    
    @g.setter
    def g(self, value):
        self.__g = value
        if self.g < math.inf and self.h < math.inf:
            self.f = self.g + self.h
    
    @property
    def h(self):
        return self.__h

    @h.setter
    def h(self, value):
        self.__h = value
        if self.g < math.inf and self.h < math.inf:
            self.f = self.g + self.h
    
class OpenSet(object):

    def __init__(self):
        self.positions = set() #
        self.heap = []
    
    def pop_elt(self):
        while True:
            _, elt = heapq.heappop(self.heap)
            if (elt.row, elt.col) in self.positions:
                self.positions.remove((elt.row, elt.col))
                return elt

    def remove(self, elt):
        self.positions.remove((elt.row, elt.col))
    
    def add(self, elt):
        self.positions.add((elt.row, elt.col))
        heapq.heappush(self.heap, (elt.f, elt))
    
    def is_empty(self):
        return len(self.positions) == 0

def find_path(maze, src, dest, alarm):
    
    def heuristic(src, dst):
        md = math.fabs(src[0] - dst[0]) + math.fabs(src[1] - dst[1])
        return md
    
    def construct_path(elt):
        rev = []
        while elt is not None:
            rev.append((elt.row, elt.col))
            elt = elt.parent
        return list(reversed(rev))

    closed_set = set()
    open_set = OpenSet()
    src_elt = Elt(src[0], src[1])
    src_elt.g = 0
    src_elt.h = heuristic(src, dest)
    open_set.add(src_elt)
    while not open_set.is_empty():
        elt = open_set.pop_elt()
        print((elt.row, elt.col), file=sys.stderr)
        if elt.row == dest[0] and elt.col == dest[1]:
            p = construct_path(elt)
            print(str(len(p)) + ' alarm ' + str(alarm), file=sys.stderr)
            if len(p) <= (alarm + 1):
                return p
            else:
                pass
        else:    
            closed_set.add((elt.row, elt.col))
            
            neighbors = all_neighbors((elt.row, elt.col), maze, closed_set)
            for neighbor in neighbors:
                neighbor_elt = Elt(neighbor[0], neighbor[1])
                neighbor_elt.g = elt.g + 1
                neighbor_elt.h = heuristic(neighbor, dest)
                neighbor_elt.parent = elt
                open_set.add(neighbor_elt)

r, c, a = [int(i) for i in input().split()]

maze = Maze(r, c)
visited = set()
curr = None # the search leaf node before control room is known
is_first = True
traversed = False
is_go = True
path_go = None
path_back = None

while True:
    kr, kc = [int(i) for i in input().split()]
    input_pos = (kr, kc)
    for i in range(r):
        row = input()
        maze.update_row(i, row)
    # traverse the map using backtracing
    if is_first:
        curr = Node(input_pos)
        is_first = False
    
    if not traversed:
        visited.add(input_pos)
        lst_child = all_neighbors(input_pos, maze, visited)
        dst = next((x for x in lst_child if not maze.is_control_room(x)), None)
        if dst is not None:
            # print(dst, file=sys.stderr)
            direction = get_direction(input_pos, dst)
            print(direction)
            parent = curr
            child = Node(dst)
            child.parent = parent
            curr = child
        else:
            # go back to parent
            if curr.parent is None:
                traversed = True # finished traversing map, back to the beginning
            else:
                direction = get_direction(input_pos, curr.parent.position)
                print(direction)
                curr = curr.parent
    
    if traversed:
        if input_pos == maze.control_room:
            is_go = False
        if is_go and path_go is None:
            path_go = find_path(maze, input_pos, maze.control_room, a)
            print(path_go, file=sys.stderr)
        if not is_go and path_back is None:
            path_back = find_path(maze, maze.control_room, maze.starting_point, a)
            print(path_back, file=sys.stderr)
        path = path_go if is_go else path_back
        print(get_direction(input_pos, path[path.index(input_pos) + 1]))

