from setuptools import setup

def readme():
    with open('README.rst') as f:
        return f.read()

setup(name='truffle',
      version='0.1',
      description='Code search, documentation aid, code visualizer',
      url='',
      author='1traintech',
      author_email='onetraintech@gmail.com',
      packages=['truffle'],
      dependency_links=[],
      install_requires=[],
      include_package_data=True,
      scripts=['bin/truffle'],
      zip_safe=False)
