import sys
import math
from typing import Tuple

# Auto-generated code below aims at helping you parse
# the standard input according to the problem statement.
# ---
# Hint: You can use the debug stream to print initialTX and initialTY, if Thor seems not follow your orders.

# light_x: the X position of the light of power
# light_y: the Y position of the light of power
# initial_tx: Thor's starting X position
# initial_ty: Thor's starting Y position
light_x, light_y, initial_tx, initial_ty = [int(i) for i in input().split()]

tx: int = initial_tx
ty: int = initial_ty
# game loop
while True:
    remaining_turns = int(input())  # The remaining amount of turns Thor can move. Do not remove this line.

    # Write an action using print
    # To debug: print("Debug messages...", file=sys.stderr)
    def calc_y(y: int) -> Tuple[int, str]:
        if y > light_y:
            return y - 1, 'N'
        elif y < light_y:
            return y + 1, 'S'
        else:
            return y, ''

    def calc_x(x: int) -> Tuple[int, str]:
        if x > light_x:
            return x - 1, 'W'
        elif x < light_x:
            return x + 1, 'E'
        else:
            return x, ''

    ty, dy = calc_y(ty)
    tx, dx = calc_x(tx)

    # A single line providing the move to be made: N NE E SE S SW W or NW
    print(dy + dx)

