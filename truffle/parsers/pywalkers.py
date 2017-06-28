"""
@Author: AmoL Kapoor
Node walker.
"""
import ast

class VariableNodeWalker(ast.NodeVisitor):

    def __init__(self, fname):
        self.context = [fname]
        self.var_name = []
        self.data = {}
    def get_data(self):
        return self.data

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
        if var_name in self.data:
            self.data['%s.%s' % (var_name, node.lineno)] = {
                'lineno':self.data[var_name],
                'context': '.'.join(self.context)
            }
        else:
            self.data[var_name] = node.lineno

        self.generic_visit(node)
        self.var_name.pop()

class FunctionNodeWalker(VariableNodeWalker):

    def visit_FunctionDef(self, node):
        self.var_name.append(node.name)
        var_name = '.'.join(self.var_name)
        context = '.'.join(self.context)
        self.data['%s.%d' % (var_name, node.lineno)] = {'node': node,
                                                        'scope': context}
        self.context.append(node.name)
        self.generic_visit(node)
        self.context.pop()
        self.var_name.pop()

    def visit_ClassDef(self, node):
        self.var_name.append(node.name)
        var_name = '.'.join(self.var_name)
        context = '.'.join(self.context)
        self.data['%s.%d' % (var_name, node.lineno)] = {'node': node,
                                                        'scope': context}
        self.context.append(node.name)
        self.generic_visit(node)
        self.context.pop()
        self.var_name.pop()

    def visit_Name(self, node):
        self.generic_visit(node)

class FunctionCallNodeWalker(FunctionNodeWalker):

    def visit_FunctionDef(self, node):
        self.var_name.append(node.name)
        var_name = '.'.join(self.var_name)
        context = '.'.join(self.context)
        self.data['%s.%s.%d' % (context, var_name,
                                node.lineno)] = {'node': node}
        self.context.append(node.name)
        self.generic_visit(node)
        self.context.pop()
        self.var_name.pop()

    def visit_ClassDef(self, node):
        self.var_name.append(node.name)
        var_name = '.'.join(self.var_name)
        context = '.'.join(self.context)
        self.data['%s.%s.%d' % (context, var_name,
                                node.lineno)] = {'node': node}
        self.context.append(node.name)
        self.generic_visit(node)
        self.context.pop()
        self.var_name.pop()

    def visit_Name(self, node):
        self.generic_visit(node)

