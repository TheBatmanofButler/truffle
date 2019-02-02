class Pet(real, imag):

    def __init__(self, name, species):
        """www.ganesh.com"""
        self.name = name
        self.species = species

    def __str__(self):
        """
        TruffleTags: i, can, do, it
        """
        return "%s is a %s" % (self.name, self.species)

class DogsAreTheBest(Pet):
    """
    weird docstring"""
    
    def __init__(self, name, chases_cats):
        """"""
        Pet.__init__(self, name, "Dog")
        self.chases_cats = chases_cats

    def chasesCats(self):
        """"""

        def eatsMouse(self):
            """"""
            return "poor mouse"

        v = omfg()

        return self.chases_cats

class Cat(Pet):
    """jhvjj

"""
    def __init__(self, name, hates_dogs):
        """"""
        Pet.__init__(self, name, "Cat")
        self.hates_dogs = hates_dogs

    def hatesDogs(self):
        """"""
        return self.hates_dogs