"""
Author: Amol Kapoor
Description: Provides API for indexing code base.
"""

import json
import os

import global_constants as gc
import parsers.pyparser as pyparser
import text_index


def _get_parsers(files, root):
    """For each file in files, get the appropriate ast tree."""
    parsers = []
    for fname in files:
        parser = _map_file_to_parser(fname, root)
        parsers.append(parser)
    return parsers


def _map_file_to_parser(fname, root):
    """Return the right parser class."""
    # TODO: Make this do the right thing; right now only does python.
    if not fname.endswith('py'):
        raise ValueError('file type not implemented; check _map_file_to_parser')
    return pyparser.PyParser(fname, root)


def get_files(code_dir):
    """Gets a list of files that can be processed by truffle."""
    files = []
    for (dirpath, _, filenames) in os.walk(code_dir):
        filenames = [os.path.join(dirpath, f) for f in filenames if
                     f.endswith(gc.SUPPORTED_LANGS)]
        files.extend(filenames)
    return files


def index_code(code_dir):
    """Gets a new project index object."""
    return ProjectIndex(code_dir)


class ProjectIndex(object):
    """Holds the index for the entire project."""

    def __init__(self, code_dir, index_fname='project_index.json'):
        self.root = code_dir
        self.files = get_files(code_dir)
        self.text_searcher = text_index.index_text(self.files)
        self.parsers = _get_parsers(self.files, self.root)
        self.project_index = self._index_code()
        self._get_calling_functions()

        with open(index_fname, 'w') as f:
            json.dump(self.project_index, f)

    def _append_call(self, source, caller):
        """Appends call to source from caller in source function location."""
        for _, file_obj in self.project_index.iteritems():
            if source in file_obj['functions']:
                file_obj['functions'][source]['calling_functions'].append(
                    caller)
                break

    def _get_calling_functions(self):
        """Parses the project_index and adds calling functions."""
        for _, file_obj in self.project_index.iteritems():
            for _, call in file_obj['calls'].iteritems():
                source = call['source']
                caller = call['caller']
                self._append_call(source, caller)

    def _index_code(self):
        """Returns a list of index objects."""
        project_index = {}
        for parser in self.parsers:
            file_index = parser.index_code()
            project_index[parser.fname] = file_index
        return project_index

    def get_text_search(self, query):
        """ Gets the text search hits """
        return text_index.search_text(self.text_searcher, query)
