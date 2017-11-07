import { Container as BaseContainer, decorate, inject as _inject, injectable as _injectable, interfaces, postConstruct } from "inversify";
import { makeFluentProvideDecorator, makeProvideDecorator } from "inversify-binding-decorators";
import getDecorators from "inversify-inject-decorators";


export type ServiceIdentifier = interfaces.ServiceIdentifier<any>;

/**
 * Extended InversifyJS Container. Adds a few helper methods
 */
export class Container extends BaseContainer {

    /**
     * Create an instance of a class using the container, making it injectable at runtime and able to @inject on the fly
     * @param cls
     * @param factoryMethod
     * @returns {T}
     */
    build<T>(cls: any, factoryMethod?: (context: interfaces.Context) => any): T {

        if ( factoryMethod ) {
            this.ensureInjectable(cls);
            let k = 'temporary.kernel.binding';
            this.bind(k).toFactory<any>(factoryMethod);
            let instance = this.get<T>(k);
            this.unbind(k);
            return instance;

        }
        return this.resolve<T>(cls);

    }

    /**
     * make binds the class in the IoC container if not already bound. then returns the bound instance
     *
     * @param cls
     * @returns {T}
     */
    make<T>(cls: any): T {
        return this.resolve<T>(cls);
    }

    getParentClasses(cls: Function, classes: Function[] = []): Function[] {
        if ( cls[ '__proto__' ] !== null ) {
            classes.push(cls);
            return this.getParentClasses(cls[ '__proto__' ], classes)
        }
        return classes;
    }

    ensureInjectable(cls: Function) {
        try { decorate(injectable(), cls); } catch ( err ) {
            console.log('ensureInjectable', err)
        }
    }

    bindTo(id: ServiceIdentifier) {
        return provide(id);
    }

    lazyInject(id: ServiceIdentifier) {
        return lazyInject(id);
    }

    singleton(id: ServiceIdentifier, cls: any) {
        this.ensureInjectable(cls);
        this.bind(id).to(cls).inSingletonScope();
    }

    inject(id: ServiceIdentifier): (target: any, targetKey: string, index?: number | undefined) => void {
        return <any> inject(id);
    }

    injectable() {
        return _injectable();
    }

    decorate(decorator: (ClassDecorator | ParameterDecorator), target: any, parameterIndex?: number) {
        return decorate(decorator, target, parameterIndex);
    }

    constant<T>(id: string, val: T) {
        return this.bind(id).toConstantValue(val);
    }
}

/**
 * The IoC Container instance, used by all exported decorators
 * @type {Container}
 */
export const container: Container = new Container()

/**
 * @decorator
 */
export const injectable = () => _injectable()

/**
 * @decorator
 * @type {(serviceIdentifier: (string | symbol | interfaces.Newable<any> | interfaces.Abstract<any>)) => (null: any, null: string) => void}
 */
export const lazyInject = getDecorators(container).lazyInject;

/**
 * @decorator
 * @type {(serviceIdentifier: (string | symbol | interfaces.Newable<any> | interfaces.Abstract<any>)) => (null: any) => any}
 */
export const provide    = makeProvideDecorator(container);

/**
 * @decorator
 * @type {(serviceIdentifier: interfaces.ServiceIdentifier<any>) => interfaces.ProvideInWhenOnSyntax<any>}
 */
const fprovide  = makeFluentProvideDecorator(container);

/**
 * @decorator
 * @param {ServiceIdentifier} identifier
 * @returns {ClassDecorator}
 */
export function singleton (identifier: ServiceIdentifier) : ClassDecorator {
    return <T>(cls:any) : T => {
        container.ensureInjectable(cls);
        container.bind(identifier).to(cls).inSingletonScope();
        return cls;
    }
}

/**
 * @decorator
 * @param {ServiceIdentifier} id
 * @returns {(target: any, targetKey: string, index?: number) => void}
 */
export const inject = (id: ServiceIdentifier) => {
    return _inject(id);
}
/**
 * @decorator
 * @param {ServiceIdentifier} id
 * @returns {(null: any) => any}
 */
export const bindTo = (id: ServiceIdentifier) => {
    return container.bindTo(id);
}

export { postConstruct } from 'inversify'
export { autoProvide, makeFluentProvideDecorator, makeProvideDecorator } from 'inversify-binding-decorators'
export * from 'inversify-inject-decorators'