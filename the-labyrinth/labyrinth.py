# -*- coding: utf-8 -*-
import sys
import math

# Auto-generated code below aims at helping you parse
# the standard input according to the problem statement.

# r: number of rows.
# c: number of columns.
# a: number of rounds between the time the alarm countdown is activated and the time the alarm goes off.
r, c, a = [int(i) for i in input().split()]

# game loop
while True:
    # kr: row where Kirk is located.
    # kc: column where Kirk is located.
    kr, kc = [int(i) for i in input().split()]
    for i in range(r):
        row = input()  # C of the characters in '#.TC?' (i.e. one line of the ASCII maze).

    # Write an action using print
    # To debug: print("Debug messages...", file=sys.stderr)

    # Kirk's next move (UP DOWN LEFT or RIGHT).
    print("RIGHT")