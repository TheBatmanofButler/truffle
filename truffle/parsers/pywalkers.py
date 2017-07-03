"""
@Author: AmoL Kapoor
Node walker.
"""
import ast

class FileWalker(ast.NodeVisitor):

    def __init__(self):
        self.context = []
        self.var_name = []
        self.functions = {}
        self.variables = {}

    def visit_FunctionDef(self, node):
        self.functions[node] = {
            'calls': {}
        }
        self.context.append(node)
        self.generic_visit(node)
        self.context.pop()

    def visit_ClassDef(self, node):
        self.functions[node] = {
            'calls': {}
        }
        self.context.append(node)
        self.generic_visit(node)
        self.context.pop()

    def visit_Call(self, node):
        if self.context:
            last_context = self.context[-1]
            self.functions[last_context]['calls'][node] = self.var_name
        self.generic_visit(node)

    def visit_Lambda(self, node):
        # lambdas are just functions, albeit with no statements
        self.context.append('lambda')
        self.generic_visit(node)
        self.context.pop()

    def vist_Attribute(self, node):
        self.var_name.append(node.value)
        self.generic_visit(node)
        self.var_name.pop()

    def visit_Name(self, node):
        self.var_name.append(node.id)

        var_name = '.'.join(self.var_name)
        if var_name in self.variables:
            self.variables[node] = self.variables[var_name]
        else:
            self.variables[var_name] = node

        self.generic_visit(node)
        self.var_name.pop()
