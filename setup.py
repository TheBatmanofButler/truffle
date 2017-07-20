import setuptools
from setuptools import setup

def readme():
    with open('README.rst') as f:
        return f.read()

setup(name='truffle',
      version='0.1dev',
      description='Code search, documentation aid, code visualizer',
      entry_points={
          'console_scripts': ['truffle=truffle.app:main'],
      },
      url='http://truffle.1train.tech',
      author='1traintech',
      author_email='onetraintech@gmail.com',
      packages=setuptools.find_packages(),
      dependency_links=[],
      install_requires=['flask', 'whoosh'],
      include_package_data=True,
      zip_safe=False)
