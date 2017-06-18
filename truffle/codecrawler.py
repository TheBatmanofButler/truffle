import ast, os

class CodeCrawler:

	def __init__(self, fname, files, functions, calls):
		self.fname = fname
		self.fname_short = fname[:-len(".py")]
		self.root = ast.parse(open(fname, 'r').read())
		self.files = files
		self.functions = functions
		self.calls = calls

		self.get_functions(self.root, self.fname_short)
		self.populate_called_functions()

	def _get_node_layer(self, node, is_for_calls):
		node_layer = []

		for child in ast.iter_child_nodes(node):
			if not is_for_calls and (isinstance(child, ast.ClassDef) or isinstance(child, ast.FunctionDef)):
				node_layer.append(child)
			elif is_for_calls and isinstance(child, ast.Call):
				node_layer.append(child)

		return node_layer

	def _add_to_files(self, node, path):
		if self.fname in self.files:
			self.files[self.fname].append(path)
		else:
			self.files[self.fname] = [path]

	def _add_to_functions(self, node, path):

		def adsfjkasf():
			print "ok"

		self.functions[path] = {
					"node": node,
					"fname": self.fname,
					"called_functions": []
					}

	def _update_path(self, node, path):
		return path + "." + node.name

	def _get_terminal_path(self, node, path):
		return path + "." + node.name + "." + str(node.lineno)

	def _record_function(self, node, path):
		path_terminal = self._get_terminal_path(node, path)
		self._add_to_files(node, path_terminal)
		self._add_to_functions(node, path_terminal)

	# def _get_function_calls(self, node):
	#     return [n for n in ast.walk(node)
	#             if isinstance(n, ast.Call)]

	def _get_name(self, node):

	    if isinstance(node.func, ast.Attribute):
	        name = ''
	        node = node.func
	        while not isinstance(node, ast.Name):
	            if isinstance(node, ast.Call):
	                node = node.func
	            elif isinstance(node, ast.Attribute):
	                name = node.attr + '.' + name if len(name) else node.attr
	                node = node.value
	            elif isinstance(node, ast.Subscript):
	                node = node.value
	            else:
	                break

	        if isinstance(node, ast.Name):
				name = (node.id + '.' + name) if len(name) else node.id
	        return (name, False)
	    else:
	        return (node.func.id, True)

	def get_functions(self, node=None, path=None):

		node_layer = self._get_node_layer(node, False)

		if isinstance(node, ast.ClassDef):
			path = self._update_path(node, path)

		elif isinstance(node, ast.FunctionDef):
			self._record_function(node, path)

			if len(node_layer) == 0:
				return
			else:
				path = self._update_path(node, path)

		for child in node_layer:
			self.get_functions(child, path)

	def _get_function_calls(self, funcnode=None, path=None):

		node_layer = self._get_node_layer(funcnode, True)
		# print node_layer
		return node_layer
		# if isinstance(node, ast.ClassDef):
		# 	path = self._update_path(node, path)

		# elif isinstance(node, ast.FunctionDef):
		# 	self._record_function(node, path)

		# 	if len(node_layer) == 0:
		# 		return
		# 	else:
		# 		path = self._update_path(node, path)

		# for child in node_layer:
		# 	self.get_functions(child, path)

	def populate_called_functions(self):


		# blerg = self._get_function_calls(node)
		# g = []
		# for n in blerg:
			# g.append(self._get_name(n))

		for func in self.functions.values():
			for call in self._get_function_calls(func["node"]):
				print call