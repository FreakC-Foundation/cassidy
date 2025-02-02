enum TokenType {
    SINGLE_QUOTE,
    DOUBLE_QUOTE,
    ESCAPED_SINGLE_QUOTE,
    ESCAPED_DOUBLE_QUOTE,
    TEMPLATE_LITERAL,
    ESCAPED_TEMPLATE_LITERAL,
    L_PAREN,
    R_PAREN,
    L_BRACKET,
    R_BRACKET,
    L_CURLY,
    R_CURLY,
    VALUE,
    BITWISE_OPERATOR,
    LOGICAL_OPERATOR,
    COMPARISON_OPERATOR,
    ASSIGNMENT_OPERATOR,
    MATH_OPERATOR,
    WHITESPACE,
    LINE_FEED,
    ARROW_FUNCTION,
    SEMICOLON,
    COMMENT,
    MULTILINE_COMMENT_START,
    MULTILINE_COMMENT_END,
    COMMA,
    DOT,
    // Preprocessor types
    STRING,
    TEMPLATE_STRING,
    IF,
    VOID,
    INT,
    BOOL,
    CLASS,
    METHOD,
    FOR,
    WHILE,
    ELSE_IF,
    ELSE,
    BREAK,
    TYPEOF,
    STRUCT,
    TYPE,
    ASYNC,
    AWAIT,
    SWITCH,
    CASE,
    DEFAULT,
    STATIC,
    VAR_STRING,
    VAR_BOOL,
    USING
}
interface Token {
    type: TokenType;
    line: number
    startCol: number;
    endCol?: number;
    value?: any;
}

class Lexer {
    constructor() {};
    public static tokens: Array<Token>;
    public static buildToken(input: string) {
        let charstream = input.split("");
        let stack = "";
        let lookahead = (n: number) => charstream[n+1];
        let eat = (t: Token) => this.tokens.push(t);
        let col = 1, line = 1
        for (let i = 0; i<charstream.length; i++) {
            let char = charstream[i];
            switch (char) {
                case "\'":
                    if (this.tokens[this.tokens.length-1].type !== TokenType.SINGLE_QUOTE && stack !== "") {
                        eat({type:TokenType.VALUE, value: stack, line: line, startCol: col});
                        stack = "";
                    }
                    if (stack === "\\") {
                        eat({type: TokenType.ESCAPED_SINGLE_QUOTE, line: line, startCol: col});
                    } else if (stack === "") {
                        eat({type: TokenType.SINGLE_QUOTE, line: line, startCol: col});
                    } else {
                        eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length-1});
                        stack = "";
                        eat({type:TokenType.SINGLE_QUOTE, line: line, startCol: col});
                    }
                    col+=1;
                        break;
                case "\"":
                    if (this.tokens[this.tokens.length-1].type !== TokenType.DOUBLE_QUOTE && stack !== "") {
                        eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                        stack = "";
                    }
                    if (stack === "\\") {
                        eat({type: TokenType.ESCAPED_DOUBLE_QUOTE,line: line, startCol: col});
                    } else if (stack === "") {
                        eat({type: TokenType.DOUBLE_QUOTE,line: line, startCol: col});
                    } else {
                        eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                        stack = "";
                        eat({type:TokenType.DOUBLE_QUOTE,line: line, startCol: col});
                    }
                    col+=1;
                        break;
                case " ":
                    eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                    stack = "";
                    eat({type:TokenType.WHITESPACE,line: line, startCol: col});
                    col+=1;
                        break;
                case "\t":
                    eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                    stack = "";
                    eat({type:TokenType.WHITESPACE,line: line, startCol: col});
                    col+=1;
                        break;
                case ";":
                    eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                    stack = "";
                    eat({type:TokenType.SEMICOLON,line: line, startCol: col});
                    col+=1;
                        break;
                case "\n":
                    eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                    stack = "";
                    eat({type:TokenType.LINE_FEED,line: line, startCol: col});
                    col+=1;
                        break;
                case "-":
                    if (stack === "-") {
                        eat({type:TokenType.MATH_OPERATOR, value: "--",line: line, startCol: col});
                        stack = ""
                    } else if (stack !== "-" && lookahead(i)!=="-") {
                        eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                        stack = "";
                        if (lookahead(i)==="=") {
                            stack+=char;
                        } else {
                            eat({type:TokenType.MATH_OPERATOR, value: "-",line: line, startCol: col});
                            stack = "";
                        }
                    }
                    col+=1;
                        break;
                case "+":
                    if (stack === "+") {
                        eat({type:TokenType.MATH_OPERATOR, value: "++",line: line, startCol: col});
                        stack = ""
                    } else if (stack !== "+" && lookahead(i)!=="+") {
                        eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                        stack = "";
                        if (lookahead(i)==="=") {
                            stack+=char;
                        } else {
                            eat({type:TokenType.MATH_OPERATOR, value: "+",line: line, startCol: col});
                            stack = "";
                        }
                    }
                    col+=1;
                        break;
                case "*":
                    if (stack === "*") {
                        if (lookahead(i)==="=") {
                            eat({type:TokenType.ASSIGNMENT_OPERATOR, value: "**=",line: line, startCol: col});
                            stack = "";
                        } else {
                            eat({type:TokenType.ASSIGNMENT_OPERATOR, value: "**",line: line, startCol: col});
                            stack = "";
                        }
                    } else if (stack === "/") {
                        eat({type:TokenType.MULTILINE_COMMENT_START,line: line, startCol: col});
                        stack = "";
                    } else if (stack !== "*" && lookahead(i)!=="*") {
                        eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                        stack = "";
                        if (lookahead(i)==="=") {
                            eat({type:TokenType.ASSIGNMENT_OPERATOR, value: "*=",line: line, startCol: col, endCol: col+1});
                        } else if (lookahead(i)==="/") {
                            stack+=char;
                        } else {
                            eat({type:TokenType.MATH_OPERATOR, value: "*",line: line, startCol: col});
                        }
                    }
                    col+=1;
                        break;
                case "|":
                    if (stack === "|") {
                        if (lookahead(i)==="=") {
                            stack+=char;
                        } else {
                            eat({type:TokenType.LOGICAL_OPERATOR, value: "||",line: line, startCol: col});
                            stack = ""
                        }
                    } else if (stack !== "|" && lookahead(i)!=="|") {
                        eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                        stack = "";
                        if (lookahead(i)==="=") {
                            stack+=char;
                        } else {
                            eat({type:TokenType.BITWISE_OPERATOR, value: "|",line: line, startCol: col});
                        }
                    }
                    col+=1;
                        break;
                case "&":
                    if (stack === "&") {
                        eat({type:TokenType.LOGICAL_OPERATOR, value: "&&",line: line, startCol: col});
                        stack = "";
                    } else if (stack !== "&" && lookahead(i)!=="&") {
                        eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                        stack = "";
                        if (lookahead(i)==="=") {
                            stack+=char;
                        } else {
                            eat({type:TokenType.BITWISE_OPERATOR, value: "&",line: line, startCol: col});
                        }
                    }
                    col+=1;
                        break;
                case ">":
                    if (stack === ">") {
                        if (lookahead(i)!==">") {
                            if (lookahead(i)==="=") {
                                stack+=char;
                            } else {
                                eat({type:TokenType.BITWISE_OPERATOR, value: ">>",line: line, startCol: col});
                                stack = "";
                            }
                        } else {
                            stack+=char;
                        }
                    } else if (stack === ">>") {
                        if (lookahead(i)==="=") {
                            stack+=char;
                        } else {
                            eat({type:TokenType.BITWISE_OPERATOR, value: ">>>",line: line, startCol: col});
                            stack = "";
                        }
                    } else if (stack === "=") {
                        eat({type:TokenType.ARROW_FUNCTION,line: line, startCol: col});
                        stack = "";
                    } else if ((stack !== ">" && stack !== "") && lookahead(i)!==">") {
                        eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                        stack = "";
                        if (lookahead(i)==="=") {
                            stack+=char;
                        } else {
                            eat({type:TokenType.MATH_OPERATOR, value: ">",line: line, startCol: col});
                            stack = "";
                        }
                    }
                    col+=1;
                        break;
                case "<":
                    if (stack === "<") {
                        if (lookahead(i)==="=") {
                            stack+=char;
                        } else {
                            eat({type:TokenType.BITWISE_OPERATOR, value: "<<",line: line, startCol: col});
                        }
                        stack = "";
                    } else if (stack !== "<" && lookahead(i)!=="<") {
                        eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                        stack = "";
                        if (lookahead(i)==="=") {
                            stack+=char;
                        } else {
                            eat({type:TokenType.MATH_OPERATOR, value: "<",line: line, startCol: col});
                            stack = "";
                        }
                    }
                    col+=1;
                        break;
                case "/":
                    if (stack = "/") {
                        eat({type:TokenType.COMMENT,line: line, startCol: col});
                        stack = "";
                    } else if (stack.split("")[Math.max(stack.length-1, 0)] === "*") { 
                        eat({type:TokenType.MULTILINE_COMMENT_END,line: line, startCol: col});
                        stack="";
                    } else if (stack !== "/" && lookahead(i)!=="/") {
                        eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                        stack = "";
                        if (lookahead(i)==="*" || lookahead(i)==="=") {
                            stack+=char;
                        }
                        eat({type:TokenType.MATH_OPERATOR, value:"/",line: line, startCol: col});
                    }
                    col+=1;
                        break; 
                case "(":
                    eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                    stack = "";
                    eat({type:TokenType.L_PAREN,line: line, startCol: col});
                    col+=1;
                        break;
                case ")":
                    eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                    stack = "";
                    eat({type:TokenType.R_PAREN,line: line, startCol: col});
                    col+=1;
                        break;
                case "[":
                    eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                    stack = "";
                    eat({type:TokenType.L_BRACKET,line: line, startCol: col});
                    col+=1;
                        break;
                case "]":
                    eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                    stack = "";
                    eat({type:TokenType.R_BRACKET,line: line, startCol: col});
                    col+=1;
                        break;
                case "{":
                    eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                    stack = "";
                    eat({type:TokenType.L_CURLY,line: line, startCol: col});
                    col+=1;
                        break;
                case "}":
                    eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                    stack = "";
                    eat({type:TokenType.R_CURLY,line: line, startCol: col});
                    col+=1;
                        break;
                case "!":
                    eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                    stack = "";
                    if (lookahead(i) === "=") {
                        stack+=char;
                    } else {
                        eat({type:TokenType.R_CURLY,line: line, startCol: col});
                    }
                    col+=1;
                        break;
                case "^":
                    eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                    stack = "";
                    if (lookahead(i) === "=") {
                        stack+=char;
                    } else {
                        eat({type:TokenType.BITWISE_OPERATOR, value: "^",line: line, startCol: col});
                    }
                    col+=1;
                        break;
                case "?":
                    if (stack = "?") {
                        if (lookahead(i) === "=") { 
                            stack+=char;
                        } else {
                            eat({type:TokenType.LOGICAL_OPERATOR, value: "??",line: line, startCol: col});
                            stack = "";
                        }
                    } else if (stack = "" && lookahead(i) === "=") { 
                        stack+=char
                    } else {
                        eat({type:TokenType.VALUE, value: "?",line: line, startCol: col});
                    }
                    col+=1;
                        break;
                case "=":
                    switch (stack) {
                        case "=":
                            if (lookahead(i)!=="=") {
                                eat({type:TokenType.COMPARISON_OPERATOR, value:"==",line: line, startCol: col});
                            } else stack += char;
                            col+=1;
                        break;
                        case "*":
                            eat({type:TokenType.ASSIGNMENT_OPERATOR, value:"*=",line: line, startCol: col});
                            col+=1;
                        break;
                        case "**":
                            eat({type:TokenType.ASSIGNMENT_OPERATOR, value:"**=",line: line, startCol: col});
                            col+=1;
                        break;
                        case "!":
                            if (lookahead(i)!=="=") {
                                eat({type:TokenType.COMPARISON_OPERATOR, value:"!=",line: line, startCol: col});
                            } else stack+=char;
                            col+=1;
                        break;
                        case "!=":
                            eat({type:TokenType.COMPARISON_OPERATOR, value:"!==",line: line, startCol: col});
                            col+=1;
                        break;
                        case ">>":
                            eat({type:TokenType.ASSIGNMENT_OPERATOR, value:">>=",line: line, startCol: col});
                            col+=1;
                        break;
                        case "<<":
                            eat({type:TokenType.ASSIGNMENT_OPERATOR, value:"<<=",line: line, startCol: col});
                            col+=1;
                        break;
                        case ">>>":
                            eat({type:TokenType.ASSIGNMENT_OPERATOR, value:">>>=",line: line, startCol: col});
                            col+=1;
                        break;
                        case "+":
                            eat({type:TokenType.ASSIGNMENT_OPERATOR, value:"+=",line: line, startCol: col});
                            col+=1;
                        break;
                        case "-":
                            eat({type:TokenType.ASSIGNMENT_OPERATOR, value:"-=",line: line, startCol: col});
                            col+=1;
                        break;
                        case "/":
                            eat({type:TokenType.ASSIGNMENT_OPERATOR, value:"/=",line: line, startCol: col});
                            col+=1;
                        break;
                        case "%":
                            eat({type:TokenType.ASSIGNMENT_OPERATOR, value:"%=",line: line, startCol: col});
                            col+=1;
                        break;
                        case "??":
                            eat({type:TokenType.ASSIGNMENT_OPERATOR, value:"??=",line: line, startCol: col});
                            col+=1;
                        break;
                        case "|":
                            eat({type:TokenType.ASSIGNMENT_OPERATOR, value:"|=",line: line, startCol: col});
                            col+=1;
                        break;
                        case "||":
                            eat({type:TokenType.ASSIGNMENT_OPERATOR, value:"||=",line: line, startCol: col});
                            col+=1;
                        break;
                        case "^":
                            eat({type:TokenType.ASSIGNMENT_OPERATOR, value:"^=",line: line, startCol: col});
                            col+=1;
                        break;
                        default:
                            if (stack === "") {
                                if (lookahead(i)!=="=") {
                                    eat({type:TokenType.ASSIGNMENT_OPERATOR, value:"=",line: line, startCol: col});
                                } else stack += char;
                                col+=1;
                            break;
                            } else {
                                eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                                stack = "";
                                if (lookahead(i)!=="=") {
                                    eat({type:TokenType.ASSIGNMENT_OPERATOR, value:"=",line: line, startCol: col});
                                } else stack += char;
                                col+=1;
                        break;
                            }
                    }
                    col+=1;
                        break;
                case ".":
                    eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                    stack = "";
                    eat({type:TokenType.DOT,line: line, startCol: col});
                    col+=1;
                    break;
                case ":":
                    eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                    stack = "";
                    eat({type:TokenType.VALUE, value:":",line: line, startCol: col});
                    col+=1;
                    break;
                case "`":
                    if (this.tokens[this.tokens.length-1].type !== TokenType.TEMPLATE_LITERAL && stack !== "") {
                        eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                        stack = "";
                    }
                    if (stack === "") {
                        eat({type: TokenType.TEMPLATE_LITERAL,line: line, startCol: col});
                    } else {
                        eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                        stack = "";
                        eat({type:TokenType.TEMPLATE_LITERAL,line: line, startCol: col});
                    }
                    col+=1;
                    break;
                case "$":
                    eat({type:TokenType.VALUE, value: "$",line: line, startCol: col});
                    col+=1;
                        break;
                case ",":
                    eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                    stack = "";
                    eat({type:TokenType.COMMA,line: line, startCol: col});
                    col+=1;
                        break;
                case "~":
                    eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                    stack = "";
                    eat({type:TokenType.BITWISE_OPERATOR, value: "~",line: line, startCol: col});
                    col+=1;
                        break;
                case "%":
                    eat({type:TokenType.VALUE, value: stack, line: line, startCol: col, endCol: col + stack.length});
                    stack = "";
                    if (lookahead(i)==="=") {
                        stack+=char
                    } else {
                        eat({type:TokenType.MATH_OPERATOR, value: "%",line: line, startCol: col});
                    }
                    col+=1;
                        break;
                default:
                    stack+=char;
                    col+=1;
                        break;
            }
        }
    }


    public static preprocessor() {
        let lookahead = (n:number) => this.tokens[n+1];
        for (let i = 0; i<this.tokens.length; i++) {
            if (this.tokens[i].type === TokenType.DOUBLE_QUOTE) {
                let out = this.crawl(i, TokenType.DOUBLE_QUOTE);
                let length = out[0];
                this.tokens.splice(i+1, length);
                this.tokens[i] = {type: TokenType.STRING, value: out[1], line: this.tokens[i].line, startCol: this.tokens[i].startCol}
            } else if (this.tokens[i].type === TokenType.SINGLE_QUOTE) {
                let out = this.crawl(i, TokenType.SINGLE_QUOTE);
                let length = out[0];
                this.tokens.splice(i+1, length);
                this.tokens[i] = {type: TokenType.STRING, value: out[1], line: this.tokens[i].line, startCol: this.tokens[i].startCol}
            } else if (this.tokens[i].type === TokenType.TEMPLATE_LITERAL) {
                let out = this.crawl(i, TokenType.TEMPLATE_LITERAL);
                let length = out[0];
                this.tokens.splice(i+1, length);
                this.tokens[i] = {type: TokenType.TEMPLATE_STRING, value: out[1], line: this.tokens[i].line, startCol: this.tokens[i].startCol}
            } else if (this.tokens[i].type === TokenType.VALUE) {
                switch (this.tokens[i].value) {
                    case "if":
                        this.tokens[i] = {type:TokenType.IF, line: this.tokens[i].line, startCol: this.tokens[i].startCol};
                            break;
                    case "else":
                        if (lookahead(i).value === "if") {
                            this.tokens[i] = {type:TokenType.ELSE_IF, line: this.tokens[i].line, startCol: this.tokens[i].startCol};
                            this.tokens.splice(i+1, 1);
                        } else {
                            this.tokens[i] = {type:TokenType.ELSE, line: this.tokens[i].line, startCol: this.tokens[i].startCol};
                        }
                            break;
                    case "int":
                        this.tokens[i] = {type:TokenType.INT, line: this.tokens[i].line, startCol: this.tokens[i].startCol};
                            break;
                    case "break":
                        this.tokens[i] = {type: TokenType.BREAK, line: this.tokens[i].line, startCol: this.tokens[i].startCol};
                            break;
                    case "async":
                        this.tokens[i] = {type:TokenType.ASYNC, line: this.tokens[i].line, startCol: this.tokens[i].startCol};
                            break;
                    case "await":
                        this.tokens[i] = {type: TokenType.AWAIT, line: this.tokens[i].line, startCol: this.tokens[i].startCol};
                            break;
                    case "class":
                        this.tokens[i] = {type: TokenType.CLASS, line: this.tokens[i].line, startCol: this.tokens[i].startCol};
                            break;
                    case "true":
                        this.tokens[i] = {type: TokenType.BOOL, value:true, line: this.tokens[i].line, startCol: this.tokens[i].startCol};
                            break;
                    case "false":
                        this.tokens[i] = {type: TokenType.BOOL, value:false, line: this.tokens[i].line, startCol: this.tokens[i].startCol};
                            break;
                    case "string":
                        this.tokens[i] = {type: TokenType.VAR_STRING, line: this.tokens[i].line, startCol: this.tokens[i].startCol};
                            break;
                    case "bool":
                        this.tokens[i] = {type: TokenType.VAR_BOOL, line: this.tokens[i].line, startCol: this.tokens[i].startCol};
                            break;
                }
            }
        }
    }

    public static crawl(start: number, type: TokenType, end?: TokenType): [number, string] {
        let crawling = true, output = "", index = start, endType = end || type;
        while(crawling === true) {
            if (this.tokens[index+1].type !== endType) {
                output+=this.getTokenRaw(this.tokens[index+1]);
                index++;
            } else {
                crawling = false;
            }
        }
        return [index+1, output];
    }

    public static getTokenRaw(token:Token) {
        if (token.value) {
            return token.value;
        } else {
            switch(token.type) {
                case TokenType.ESCAPED_DOUBLE_QUOTE:
                    return "\"";
                case TokenType.ESCAPED_SINGLE_QUOTE:
                    return "\'";
                case TokenType.LINE_FEED:
                    return "\n";
                case TokenType.L_PAREN:
                    return "(";
                case TokenType.L_BRACKET:
                    return "[";
                case TokenType.L_CURLY:
                    return "{";
                case TokenType.R_PAREN:
                    return ")";
                case TokenType.R_BRACKET:
                    return "]";
                case TokenType.R_CURLY:
                    return "}";
                case TokenType.DOT:
                    return ".";
                case TokenType.SEMICOLON:
                    return ";";
                case TokenType.COMMA:
                    return ",";
                case TokenType.ESCAPED_TEMPLATE_LITERAL:
                    return `\``;
                case TokenType.TEMPLATE_LITERAL:
                    return "``";
                case TokenType.WHITESPACE:
                    return " ";
            }
        }
    }
}
