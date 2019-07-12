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

class AnyCharacterNode extends RegexpNode {
    constructor(next) {
        super();
        this.next = next;
    }

    derive(char) {
        return this.next;
    }
}

class RepetitionNode extends RegexpNode {
    constructor(next) {
        super();
        // head will be set properly later by modification
        this.head = NeverMatches;
        this.next = next;
    }

    derive(char) {
        const result = new AlternationNode([
            this.head.derive(char),
            this.next.derive(char),
        ]);
        return result
    }
}

// let commonTail = new CharacterNode('d', EmptyString),
//     alternation = new AlternationNode([
//         new CharacterNode('b', commonTail),
//         new CharacterNode('c', commonTail)
//     ]),
//     head = new CharacterNode('a', alternation);
// console.log(head.derive('a')) //=> the AlternationNode in the middle
// console.log(head.derive('a').derive('b')) //=> the CharacterNode 'd'
// console.log(head.derive('a').derive('e')) //=> NeverMatches
// console.log(head.derive('a').derive('b').derive('d')) //=> EmptyString; match complete


let tail = new CharacterNode('d', EmptyString),
    repetition = new RepetitionNode(tail),
    repetitionBody = new CharacterNode('a', new CharacterNode('b', new CharacterNode('c', repetition)));

// this is the side-effectual part I mentioned which sets up the cycle
repetition.head = repetitionBody;

console.log(repetition.derive('a')); //=> the CharacterNode b
console.log(repetition.derive('d')); //=> EmptyString; match complete
// let repeatedOnce = repetition.derive('a').derive('b').derive('c'); // => the same RepetitionNode again
// console.log(repeatedOnce.derive('a')) // => back to b
// console.log(repeatedOnce.derive('d')) // => EmptyString again


class _Or {
    constructor (alternatives) {
        this.alternatives = alternatives;
    }
}
function Or(alternatives) {
    if (!(alternatives instanceof Array)) {
        throw new TypeError("alternatives passed to Or must be an Array");
    } else {
        return new _Or(alternatives);
    }
}

class _ZeroOrMore {
    constructor (repeatable) {
        this.repeatable = repeatable;
    }
}
function ZeroOrMore(repeatable) {
    return new _ZeroOrMore(repeatable);
}

const Any = Symbol('Any');
