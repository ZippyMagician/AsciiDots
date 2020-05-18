/* TODO

- Class "WarpMapper"
    - Takes in input code
    - Calculates warps, entries, and imports
        - Stores them
        - Functions to check and find them
    - Will remove warps from the code, tokenize it, and store it
    - Functions
        - isWarp(op) => checks if op is a stored warp, if so true else false
        - isHomeWarp(op) => checks if op is the one specified in libraries by %^, if so true else false
        - isImportWarp(op) => checks if op denotes a warp to a specified library, if so true else false
        - find(op, x, y) => finds matching warp not at x and y
        - getImportData(op) => will create a map (using CellMap class) of new import file (fetched with fs)
            - Tokenize it similar to parser
            - Find entry point (home warp)
            - Returns [Cellmap, x, y]

*/