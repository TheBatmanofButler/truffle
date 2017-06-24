"""
@Author: AmoL Kapoor
Node walker.
"""
import ast

class VariableNodeWalker(ast.NodeVisitor):

    def __init__(self, fname):
        self.context = ['global']
        self.var_name = [fname]
        self.variables = {}

    def get_variables(self):
        return self.variables

    def visit_FunctionDef(self, node):
        self.context.append(node.name)
        self.generic_visit(node)
        self.context.pop()

    def visit_ClassDef(self, node):
        self.context.append(node.name)
        self.generic_visit(node)
        self.context.pop()

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
            self.variables['%s.%s' % (var_name,
                                      node.lineno)] = self.variables[var_name]
        else:
            self.variables[var_name] = node.lineno

        self.generic_visit(node)
        self.var_name.pop()
