/* lexical grammar */
%lex
%%
\s+                   {/* skip whitespace */}
[0-9]+("."[0-9]+)?i\b {return 'IMAGVALUE';}
[0-9]+("."[0-9]+)?\b  {return 'REALVALUE';}
[\w]+[A-z0-9_]*\b     {return 'TOKEN';}
"**"                  {return '**';}
"*"                   {return '*';}
"/"                   {return '/';}
"-"                   {return '-';}
"+"                   {return '+';}
"^"                   {return '^';}
"("                   {return '(';}
")"                   {return ')';}
","                   {return ',';}
<<EOF>>               {return 'EOF';}

/lex

%left '+' '-'
%left '*' '/'
%left '^' '**'
%left UMINUS

%start expressions

%% /* language grammar */

expressions:
  expr EOF
    {return $1;}
  ;

expr:
  expr '+' expr
    {$$ = {op: 'add', operands: [$1, $3]};}
  | expr '-' expr
    {$$ = {op: 'sub', operands: [$1, $3]};}
  | expr '*' expr
    {$$ = {op: 'mul', operands: [$1, $3]};}
  | expr '/' expr
    {$$ = {op: 'div', operands: [$1, $3]};}
  | expr '^' expr
    {$$ = {op: 'pow', operands: [$1, $3]};}
  | expr '**' expr
    {$$ = {op: 'pow', operands: [$1, $3]};}
  | '-' expr %prec UMINUS
    {$$ = {op: 'uminus', operands: [$2]};}
  | TOKEN '(' expr ',' expr ')'
    {$$ = {op: 'function', operands: [$3, $5], name: $1};}
  | TOKEN '(' expr ')'
    {$$ = {op: 'function', operands: [$3], name: $1};}
  | TOKEN 
    {$$ = {op: 'variable', name: yytext};}
  | '(' expr ')'
    {$$ = {op: 'group', operands: [$2]};}
  | REALVALUE
    {$$ = {op: 'realvalue', value: Number(yytext)};}
  | IMAGVALUE
    {$$ = {op: 'imagvalue', value: Number(yytext.replace(/i$/, ''))};}
  ;
