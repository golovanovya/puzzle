const {assert, expect} = require("chai");
const {Element} = require("../src/primitives");

describe("Element creation", () => {
    it("Create empty", () => {
        const element = new Element();
        assert.isObject(element);
    });

    it("Create with children", () => {
        const firstChild = new Element();
        const secondChild = new Element();
        const thirdChild = new Element();
        
        const firstParent = new Element(firstChild, secondChild, thirdChild);
        expect(firstParent.elements)
            .include(firstChild)
            .include(secondChild)
            .include(thirdChild);
    });
});

describe("Remove child element", () => {
    it("Remove children", () => {
        const firstChild = new Element();
        const secondChild = new Element();
        const thirdChild = new Element();
        
        const firstParent = new Element(firstChild, secondChild, thirdChild);
        expect(firstParent.elements)
            .include(firstChild)
            .include(secondChild)
            .include(thirdChild);
        assert.isTrue(firstChild.parent === firstParent);
        assert.isTrue(firstChild.parent === secondChild.parent);
        assert.isTrue(firstChild.parent === thirdChild.parent);

        firstParent.remove(firstChild);
        expect(firstParent.elements)
            .does.not.include(firstChild);
        assert.isNull(firstChild.parent);

        firstParent.remove(secondChild);
        expect(firstParent.elements)
            .does.not.include(secondChild);
        assert.isNull(secondChild.parent);

        firstParent.remove(thirdChild);
        expect(firstParent.elements)
            .does.not.include(thirdChild);
        assert.isNull(thirdChild.parent);

        // expect(() => {throw new Error("element not found")}).to.throw("element not found");
    });
});

describe("Element adding", () => {
    it("Adding element from another one", () => {
        const firstChild = new Element();
        const secondChild = new Element();
        const thirdChild = new Element();

        const firstParent = new Element(firstChild);
        const secondParent = new Element(secondChild);
        const thirdParent = new Element(thirdChild);

        secondParent.add(firstChild);
        expect(secondParent.elements)
            .include(firstChild)
            .include(secondChild);
        assert.isTrue(firstChild.parent === secondChild.parent);
        assert.isEmpty(firstParent.elements);

        thirdParent.add(secondChild);
        thirdParent.add(firstChild);
        expect(thirdParent.elements)
            .include(firstChild)
            .include(secondChild)
            .include(thirdChild);
        
        assert.isTrue(firstChild.parent === secondChild.parent);
        assert.isTrue(firstChild.parent === thirdChild.parent);
    });

    it("Adding element in loop", () => {
        const firstChild = new Element();
        const secondChild = new Element();
        const thirdChild = new Element();

        const firstParent = new Element(firstChild);
        const secondParent = new Element(secondChild);
        const thirdParent = new Element(thirdChild);

        secondParent.add(firstChild);
        expect(secondParent.elements)
            .include(firstChild)
            .include(secondChild);
        assert.isTrue(firstChild.parent === secondChild.parent);
        assert.isEmpty(firstParent.elements);

        while (secondParent.elements.length > 0) {
            const child = secondParent.elements[0];
            thirdParent.add(child);
        }
        expect(thirdParent.elements)
            .include(firstChild)
            .include(secondChild)
            .include(thirdChild);
        
        assert.isTrue(firstChild.parent === secondChild.parent);
        assert.isTrue(firstChild.parent === thirdChild.parent);
    });
})
