import Reflex from "../Reflex";
import { trace } from "./instruction/trace";

describe('Controller', () => {
    let reflex: Reflex = new Reflex();
    // let machine: Machine = reflex.machine;
    let controller = reflex.machine.controller;
    it('label', () => {
        expect(()=>
            controller.execute(['label', 'noop'])
        ).not.toThrow()
    })
    it('halt', () => {
        expect(()=>
            controller.execute(['halt', 'in the name of love'])
        ).not.toThrow()
    })
    test.todo('invoke')
    test.todo('invoke with block')
    test.todo('jump')
    test.todo('jump_if')
    // let fakeMachine = jest.mock('Machine');
    // let controller: Controller = new Controller(fakeMachine)
    // it('executes instructions', () => {
    //     expect(controller.execute(['label', 'foo']))
    // })
})