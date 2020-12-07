const {assert, expect} = require("chai");
const {Group, Element} = require("../src/primitives");

describe("Creation empty element", function () {

    it("Merge multiple groups", () => {
        const firstChild = new Element();
        const secondChild = new Element();
        const thirdChild = new Element();
        const firstParent = new Group(firstChild);
        const secondParent = new Group(secondChild);
        const thirdParent = new Group(thirdChild);
        secondParent.merge(firstParent);
        expect(secondParent.elements)
            .include(firstChild)
            .include(secondChild);
        assert.isEmpty(firstParent.elements);

        thirdParent.merge(secondParent);
        while (secondParent.elements.length > 0) {
            thirdParent.add(secondParent.elements.shift());
        }
        thirdParent.merge(secondParent);
        expect(thirdParent.elements)
            .include(firstChild)
            .include(secondChild)
            .include(thirdChild);
        assert.isEmpty(firstParent.elements);
        assert.isEmpty(secondParent.elements);

        assert.isTrue(firstChild.parent === secondChild.parent);
        assert.isTrue(firstChild.parent === thirdChild.parent);
    });
});
