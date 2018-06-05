import sys
from typing import List, Tuple, Deque, Set, Optional
from enum import Enum, unique
from collections import deque
from math import fabs


def is_on_map(x: int, y: int) -> bool:
    return 0 <= x < 40 and 0 <= y < 18


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
    NW = 'NW',


Giants = Tuple[Tuple[int, int]]


class Node(object):

    def __init__(self, tx: int, ty: int, hammer: int, giants: Giants, mov: Optional[Move], turn: int,
                 parent: Optional['Node']):
        self.tx = tx
        self.ty = ty
        self.hammer = hammer
        self.giants = giants
        self.mov = mov
        self.turn = turn
        self.parent = parent

    def __hash__(self):
        return hash((self.tx, self.ty, self.giants))

    def __eq__(self, other):
        return (
                self.__class__ == other.__class__ and
                self.tx == other.tx and
                self.ty == other.ty and
                self.giants == other.giants
        )

    def __str__(self):
        return str(self.tx) + "," + str(self.ty) + "," + str(self.giants)


def is_root(node: Node) -> bool:
    return node.parent is None


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
    # this is only a guess, so the simulation can take only 1 turn
    def approach(s: int, t: int) -> int:
        if s > t:
            return s - 1
        elif s < t:
            return s + 1
        else:
            return s

    return approach(x, tx), approach(y, ty)


def is_thor_live(node: Node) -> bool:
    tx = node.tx
    ty = node.ty
    giants = node.giants
    if len(giants) > 0 and node.hammer == 0:
        return False
    for giant in giants:
        if tx == giant[0] and ty == giant[1]:
            return False
    return True


def strike(tx: int, ty: int, giants: Giants) -> Giants:
    pts = [(x, y) for x in range(tx - 4, tx + 5) for y in range(ty - 4, ty + 5) if is_on_map(x, y)]
    return tuple(giant for giant in giants if giant not in pts)


def get_child_nodes(node: Node) -> List[Node]:
    def move_all_giants(x: int, y: int, giants: Giants):
        return tuple(move_giant(g[0], g[1], x, y) for g in giants)

    ans = []
    if not is_thor_live(node):
        return ans
    if not is_root(node):
        child = Node(node.tx, node.ty, node.hammer, move_all_giants(node.tx, node.ty, node.giants), Move.WAIT, node.turn + 1, node)
        if is_thor_live(child):
            ans.append(child)
    else:
        ans.append(Node(node.tx, node.ty, node.hammer, node.giants, Move.WAIT, node.turn + 1, node))
    if node.hammer >= 1:
        child = Node(node.tx, node.ty, node.hammer - 1, strike(node.tx, node.ty, node.giants), Move.STRIKE, node.turn + 1,
                 node)
        if is_thor_live(child):
            ans.append(child)
    for move in Move:
        if move is Move.WAIT:
            continue
        if move is Move.STRIKE:
            continue
        x = change_x(node.tx, move)
        y = change_y(node.ty, move)
        if not is_on_map(x, y):
            continue
        transformed = move_all_giants(x, y, node.giants)
        child = Node(x, y, node.hammer, transformed, move, node.turn + 1, node)
        if is_thor_live(child):
            ans.append(child)
    return ans


def node_score(node: Node) -> float:
    sum_dist = sum([fabs(giant[0] - node.tx) + fabs(giant[1] - node.ty) for giant in node.giants])
    if sum_dist == 0:
        return 0
    return node.hammer - sum_dist/len(node.giants)


def analyze(tx: int, ty: int, hammer: int, giants: Giants, remaining_turn: int) -> Node:
    # BFS algorithm for the search
    root = Node(tx, ty, hammer, giants, None, 0, None)
    fifo_queue: Deque[Node] = deque()
    fifo_queue.append(root)
    visited: Set[Node] = set()
    visited.add(root)
    best_score = node_score(root)
    best_node = root

    while len(fifo_queue) > 0:
        node = fifo_queue.popleft()
        # print(node, file=sys.stderr)
        if len(node.giants) == 0:
            return node
        if node.turn == remaining_turn:
            score = node_score(node)
            if score > best_score:
                best_score = score
                best_node = node
            continue
        children = get_child_nodes(node)
        for child in children:
            if child not in visited:
                fifo_queue.append(child)
    return best_node


def construct_path(node: Node) -> List[Node]:
    ans = []
    while node is not None:
        ans.append(node)
        node = node.parent
    return list(reversed(ans))


if __name__ == '__main__':
    tx, ty = [int(i) for i in input().split()]

    # game loop
    while True:
        # h: the remaining number of hammer strikes.
        # n: the number of giants which are still present on the map.
        h, n = [int(i) for i in input().split()]
        giants: Giants = []
        for i in range(n):
            x, y = [int(j) for j in input().split()]
            giants.append((x, y))

        # Write an action using print
        # To debug: print("Debug messages...", file=sys.stderr)
        print(giants, file=sys.stderr)
        node = analyze(tx, ty, h, tuple(giants), 1)
        path = construct_path(node)
        if len(path) > 1:
            print(path[1], file=sys.stderr)
            print(path[1].mov.name)
            tx = path[1].tx
            ty = path[1].ty
        else:
            print(Move.STRIKE.name)
