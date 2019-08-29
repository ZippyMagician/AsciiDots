# ASCIIDots
This project is a Node.JS interpreter for the esolang [ASCIIDots](https://esolangs.org/wiki/AsciiDots), created by **Aaron Janse**

## Current Syntax

|  Character  | Description |
| :---: | :--- |
| \- | Allows the dot to move horizontally |
| \| | Allows the dot to move vertically |
| + | Acts as crossroads; dots can pass through this horizontally or vertically |
| ~ | Takes a dot input from the bottom and left; if the bottom's value is 0, then the left one continues on to the right. If the bottom's value is not, then the dot coming from the left starts moving upward |
| ! | If underneath a `~`, reverse it so that 0 makes the dot move up and any other number makes it continue on right |
| $ | Prints a value to the console |
| # | Sets the value of the dot, can also be used to get the value of the dot in a print command |
| @ | Sets the address of the dot, can also be used to get the address of the dot in a print command |
| _ | Marks that the console will not print a newline after its message |
| a | Marks that the console will print the ASCII character equivalent of a number |
| ? | Asks for user input; may only be used after a `#` or `@` |
| ^ | Changes the dot's direction to up |
| \> | Changes the dot's direction to right |
| < | Changes the dot's direction to left |
| v | Changes the dot's direction to down |
| * | A dot that hits this character will have itself duplicated, with the duplicates travelling in every possible (connected) direction |
| \\ | A "mirror" that changes the dot's direction |
| / | Another "mirror" that changes the dot's direction |
| () | Anything inside these parentheses will loop forever |
| [] | Operation inside will be evaluated; a vertical-moving dot will be eval'd against a horizontal dot. The horizontal dot will be deleted and the vertical will continue |
| & | Ends the program |
| "" or '' | Marks a string that the value or print command can use |

For more in-depth information and to see the full (not yet implemented) character set, please visit the Wiki page linked at the top of the __README__<br>
*NOTE*: Currently the `\` character is broken and will not work in the interpreter. If anyone has any solutions, please contact me on github!

## Installation
Run
```sh
npm install asciidots -g
```
to install Asciidots globally

## Running
Use the command
```sh
asciidots run FILE_PATH
```
to run a file with the asciidots interpreter.