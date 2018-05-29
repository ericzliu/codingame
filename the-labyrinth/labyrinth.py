# -*- coding: utf-8 -*-
import sys
from collections import deque

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

def all_children(pos, maze, old_pos):
    kr = pos[0]
    kc = pos[1]
    all_pos = [(kr - 1, kc), (kr + 1, kc), (kr, kc + 1), (kr, kc - 1)]
    return [p for p in all_pos if not(p in old_pos) and not(maze.is_out(p)) and not(maze.is_wall(p)) and not(maze.is_unknown(p))]

def find_path_bfs(src, dst, visited):
    final = None # last search node in the path search
    fifo_queue = deque()
    fifo_queue.append(Node(src))
    visited[src] = True
    while len(fifo_queue) > 0 and (final is None):
        node = fifo_queue.popleft()
        if dst == node.position:
            final = node
        else:
            subnodes = [Node(x) for x in all_children(node.position, maze, visited)]
            for sub_node in subnodes:
                sub_node.parent = node
            if len(subnodes) > 0:
                fifo_queue.extend(subnodes)
    if final is None:
        raise Exception('No path')
    rev = []
    while not (final is None):
        rev.append(final.position)
        final = final.parent
    return list(reversed(rev))

def trace(node):
    ans = []
    while node is not None:
        ans.append(node.position)
        node = node.parent
    return list(reversed(ans))

def find_path_dfs(src, dst, visited):
    final = None # last search node in the path search
    lifo_queue = deque()
    lifo_queue.append(Node(src))
    visited[src] = True
    while len(lifo_queue) > 0 and (final is None):
        node = lifo_queue.pop()
        if dst == node.position:
            final = node
        else:
            subnodes = [Node(x) for x in all_children(node.position, maze, visited)]
            for sub_node in subnodes:
                sub_node.parent = node
            if len(subnodes) > 0:
                lifo_queue.extend(subnodes)
    if final is None:
        raise Exception('No path')
    return trace(final)

if True:
    r, c, a = [int(i) for i in input().split()]
    
    maze = Maze(r, c)
    old_pos = {}
    curr = None # the search leaf node before control room is known
    is_control_room_seen = False
    is_go = True
    path_go = None
    path_back = None

    while True:
        kr, kc = [int(i) for i in input().split()]
        input_pos = (kr, kc)
        for i in range(r):
            row = input()
            maze.update_row(i, row)
        
        print(input_pos, file=sys.stderr)
        print((not is_control_room_seen) and maze.is_control_room_seen(), file=sys.stderr)
        if (not is_control_room_seen) and maze.is_control_room_seen():
            is_control_room_seen = True
            print('control room seen', file=sys.stderr)
            # print(str(curr.__dict__), file=sys.stderr)
            path_go = trace(curr) + find_path_bfs(input_pos, maze.control_room, old_pos)[1:]
            print(path_go, file=sys.stderr)

        if is_control_room_seen:
            if is_go and input_pos == maze.control_room:
                is_go = False
            if not is_go and path_back is None:
                path_back = find_path_bfs(maze.control_room, maze.starting_point, {})
                # TODO: USE A FASTER PATH FINDING ALGORITHM

            path = path_go if is_go else path_back
            print(get_direction(input_pos, path[path.index(input_pos) + 1]))
        else:
            # before seeing the control room, discover the map using dfs and backtracing
            if curr is None:
                curr = Node(input_pos)
            old_pos[input_pos] = True

            lst_child = all_children(input_pos, maze, old_pos)
            if len(lst_child) > 0:
                dst = next((x for x in lst_child if maze.is_control_room(x)), lst_child[0])
                print(dst, file=sys.stderr)
                direction = get_direction(input_pos, dst)
                parent = curr
                child = Node(dst)
                child.parent = parent
                curr = child
            else:
                # go back to parent
                direction = get_direction(input_pos, curr.parent.position)
                curr = curr.parent
            print(direction)
