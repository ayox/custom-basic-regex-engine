class RegexpNode {
    derive(char) {
        return NeverMatches;
    }
}

const EmptyString = new RegexpNode();
const NeverMatches = new RegexpNode();

class CharacterNode extends RegexpNode {
    constructor(char, next) {
        super(); // JavaScript makes us call this on all our subclasses even though it doesn't do anything
        this.char = char;
        this.next = next;
    }

    derive(char) {
        if (char === this.char) {
            return this.next;
        } else {
            return NeverMatches;
        }
    }
}

class AlternationNode extends RegexpNode {
    constructor(alternatives) {
        super();
        let _alternatives = alternatives.filter((alt) => alt !== NeverMatches);
        if (_alternatives.length === 0) {
            return NeverMatches;
        } else if (_alternatives.length === 1) {
            return _alternatives[0];
        } else {
            this.alternatives = _alternatives;
        }
        return this;
    }

    derive(char) {
        return new AlternationNode(this.alternatives.map((alt) => alt.derive(char)));
    }
}


let commonTail = new CharacterNode('d', EmptyString),
    alternation = new AlternationNode([
        new CharacterNode('b', commonTail),
        new CharacterNode('c', commonTail)
    ]),
    head = new CharacterNode('a', alternation);
console.log(head.derive('a')) //=> the AlternationNode in the middle
console.log(head.derive('a').derive('b')) //=> the CharacterNode 'd'
console.log(head.derive('a').derive('e')) //=> NeverMatches
console.log(head.derive('a').derive('b').derive('d')) //=> EmptyString; match complete
