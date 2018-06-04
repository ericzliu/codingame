# -*- coding: utf-8 -*-
import sys
import math
from typing import List, Tuple

# Auto-generated code below aims at helping you parse
# the standard input according to the problem statement.

# width: width of the firewall grid
# height: height of the firewall grid
width, height = [int(i) for i in input().split()]

grid = [['' for _ in range(height)] for _ in range(width)]
for y in range(height):
    map_row = input()  # one line of the firewall grid
    for x in range(width):
        grid[x][y] = map_row[x]

BOMB = '@'
PASSIVE = '#'

class Node(object):
    def __init__(self, destroyed_nodes: List[int], parent: 'Node', x: int):
        self.destroyed_nodes = destroyed_nodes
        self.parent = parent
        self.index = x

def index_to_position(x: int) -> Tuple[int, int]:
    row = x % height
    col = math.floor(x / height)
    return (col, row)

def position_to_index(col: int, row: int):
    return col * height + row

def count_surveillance(x: int) -> int:
    num = 0
    for i in range(x, width * height):
        col, row = index_to_position(i)
        if grid[col][row] == BOMB:
            num = num + 1
    return num

def destroyed_surveillance(node: Node)-> List[int]:
    res = []
    while node is not None:
        res.extend(node.destroyed_nodes)
    return res

def surveillance_inrange(p: int) -> List[int]:
    ans = []
    col, row = index_to_position(p)
    for x in range(max(0, col - 3), col):
        if grid[x][row] == BOMB:
            ans.append(position_to_index(x, row))
        elif grid[x][row] == PASSIVE:
            break
    for x in range(min(col + 1, width - 1), min(col + 4, width)):
        if grid[x][row] == BOMB:
            ans.append(position_to_index(x, row))
        elif grid[x][row] == PASSIVE:
            break
    for y in range(max(0, row - 3), row):
        if grid[col][y] == BOMB:
            ans.append(position_to_index(col, y))
        elif grid[col][y] == PASSIVE:
            break
    for y in range(min(row + 1, height - 1), min(row + 4, height)):
        if grid[col][y] == BOMB:
            ans.append(position_to_index(col, y))
        elif grid[col][y] == PASSIVE:
            break
    return ans

def bomb_index_list(node: Node) -> List[int]:
    ans = []
    while node is not None:
        ans.append(node.index)
    return ans

def fast_explode_order(bomb_locations: List[int]) -> Tuple[List[int], int]:
    # TODO: The fork-bombs explode 3 turns after having been placed.
    # A fork-bomb can explode before the 3 turns if it is triggered by the explosion of another fork-bomb.
    pass

def place_bombs(node: Node, bomb_count: int, num_round: int, x: int) -> Node:
    def list_diff(l1: List[int], l2: List[int]) -> List[int]:
        return [x for x in l1 if x not in l2]
    
    if bomb_count == 0 and count_surveillance(x) > 0:
        return None
    if x >= width * height:
        return None
    if count_surveillance(x) == 0:
        return node
    destroyed = destroyed_surveillance(node)
    for i in range(x, width * height):
        col, row = index_to_position(i)
        if grid[col][row] != '.':
            continue
        bombs = surveillance_inrange(i)
        new_destroyed = list_diff(bombs, destroyed)
        new_destroyed_count = len(new_destroyed)
        if new_destroyed_count > 0:
            child = Node(new_destroyed, node, i)
            last = place_bombs(child, bomb_count - 1, num_round, i + 1)
            if last is not None:
                bomb_locations = bomb_index_list(last)
                sorted_bomb_locations, rounds = fast_explode_order(bomb_locations)
                if rounds <= num_round:
                    return last
    raise Exception('No solution')

## game loop
while True:
    # rounds: number of rounds left before the end of the game
    # bombs: number of bombs left
    rounds, bombs = [int(i) for i in input().split()]

    # Write an action using print
    # To debug: print("Debug messages...", file=sys.stderr)

    print("3 0")