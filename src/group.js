const {Element} = require('./primitives');

class Group extends Element {
    merge(group) {
        if (this !== group) {
            group.elements.slice().forEach(element => super.add(element));
        }
    }

    add(element) {
        super.add(element);
    }
}

module.exports = Group;
