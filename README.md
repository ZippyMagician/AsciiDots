# ASCIIDots
This project is a Node.JS interpreter for the esolang [ASCIIDots](https://esolangs.org/wiki/AsciiDots)

## Current Syntax
This project currently features an incomplete syntax, the following commands ARE supported:<br>
|  Character  | Description |
| --- | --- |
| \- | Allows the dot to move horizontally                                                        |
| \| | Allows the dot to move vertically                                                          |
| \$ | Prints a value to the console                                                              |
| \# | Sets the value of the dot, can also be used to get the value of the dot in a print command |
| \_ | Marks that the console will not print a newline after its message                          |
| \^ | Changes the dot's direction to up                                                          |
| \> | Changes the dot's direction to right                                                       |
| \< | Changes the dot's direction to left                                                        |
| \v | Changes the dot's direction to down                                                        |
| \& | Ends the program                                                                           |
| \"\" | Marks a string that the value or print command can use                                   |

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