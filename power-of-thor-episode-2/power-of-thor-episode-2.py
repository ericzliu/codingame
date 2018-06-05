import sys
import math
from typing import List, Tuple
from enum import Enum, unique


def is_on_map(x: int, y: int) -> bool:
    return 0 <= x < 40 and 0 <= y < 18


# Auto-generated code below aims at helping you parse
# the standard input according to the problem statement.

tx, ty = [int(i) for i in input().split()]

@unique
class Move(Enum):
    WAIT = 'WAIT',
    STRIKE = 'STRIKE',
    N = 'N',
    NE = 'NE',
    E = 'E',
    SE = 'SE',
    S = 'S',
    SW = 'SW',
    W = 'W',
    N = 'N'


Giants = List[Tuple[int, int]]


class Node(object):

    def __init__(self, tx: int, ty: int, giants: Giants, mov: Move, parent: 'Node'):
        self.tx = tx
        self.ty = ty
        self.giants = giants
        self.mov = mov
        self.parent = parent


def is_root(node: Node) -> bool:
    return node.parent is None


def sequence_of_move(node: Node) -> List[Move]:
    ans = []
    while not is_root(node):
        ans.append(node.mov)
        node = node.parent
    return list(reversed(ans))


def change_x(x: int, move: Move) -> int:
    if move is Move.E or move is Move.SE or move is Move.NE:
        return x + 1
    elif move is Move.W or move is Move.SW or move is Move.NW:
        return x - 1
    else:
        return x


def change_y(y: int, move: Move) -> int:
    if move is Move.N or move is Move.NE or move is Move.NW:
        return y - 1
    elif move is Move.S or move is Move.SE or move is Move.SW:
        return y + 1
    else:
        return y


def move_giant(x: int, y: int, tx: int, ty: int) -> Tuple[int, int]:
    # use guessed algorithm to simulate new giant location
    def approach(s: int, t: int) -> int:
        if s > t:
            return s - 1
        elif s < t:
            return s + 1
        else:
            return s
    return approach(x, tx), approach(y, ty)


def is_thor_live(tx: int, ty: int, giants: Giants) -> bool:
    for giant in giants:
        if tx == giant[0] and ty == giant[1]:
            return False
    return True


def strike(tx: int, ty: int, giants: Giants) -> Giants:
    pts = [(x, y) for x in range(tx - 1, tx + 2) for y in range(ty - 1, ty + 2) if is_on_map(x, y)]
    return [giant for giant in giants if giant not in pts]


def alive_moves(node: Node) -> List[Node]:
    ans = []
    if not is_thor_live(node.tx, node.ty, node.giants):
        return ans
    ans.append((Move.WAIT, node.giants))
    ans.append((Move.STRIKE, strike(node.tx, node.ty, node.giants)))
    for move in Move:
        if move is Move.WAIT:
            continue
        if move is Move.STRIKE:
            continue
        x = change_x(node.tx, move)
        y = change_y(node.ty, move)
        transformed = [move_giant(g[0], g[1], x, y) for g in node.giants]
        if is_thor_live(x, y, transformed):
            ans.append(Node(x, y, transformed, move, node))
    return ans


def simulate(node: Node, remaining_turn: int) -> List[Node]:
    if remaining_turn == 0:
        return [node]
    if len(node.giants) == 0:
        return [node]
    ans = []
    subnodes = alive_moves(node)
    for subnode in subnodes:
        ans.extend(simulate(subnode, remaining_turn - 1))
    return ans


# game loop
while True:
    # h: the remaining number of hammer strikes.
    # n: the number of giants which are still present on the map.
    h, n = [int(i) for i in input().split()]
    for i in range(n):
        x, y = [int(j) for j in input().split()]

    # Write an action using print
    # To debug: print("Debug messages...", file=sys.stderr)

    # The movement or action to be carried out: WAIT STRIKE N NE E SE S SW W or N
    print("WAIT")
