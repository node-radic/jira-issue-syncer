import { Parser } from '@radic/console-colors';
import * as inquirer from 'inquirer';
import { Question } from 'inquirer';
import { container, lazyInject, singleton } from './Container';

container.bind(Parser).to(Parser)


@singleton(IO)
export class IO {
    protected out: NodeJS.WriteStream;
    protected errOut: NodeJS.WriteStream;
    protected _resetAfterWrite: boolean = true;

    @lazyInject('parser')
    private _parser: Parser

    constructor() {
        this.out    = process.stdout
        this.errOut = process.stderr
    }

    public get parser(): Parser { return this._parser }

    public set io(io: { out: NodeJS.WriteStream, errOut: NodeJS.WriteStream }) {
        this.out    = io.out;
        this.errOut = io.errOut;
    }


    public resetAfterWrite(val: boolean): this {
        this._resetAfterWrite = val;
        return this
    }

    public write(str: string): this {
        this.out.write(this._parser.parse(str))
        if ( this._resetAfterWrite ) {
            this.out.write(this._parser.parse('{reset}'))
        }
        return this;
    }

    public line = (str: string): this => this.write(str + '\n')

    public error(str: string) {
        this.write('{red.bold}ERROR{reset}')
        this.line(str);
        process.exit(1)
    }

    /**
     * Calculate terminal wrapping
     *
     * tw > 200 = make it 50% of tw
     * tw > 100 = make it 100
     * else make it tw (max)
     *
     * @param {number} terminalWidth
     */
    public calcWrap = (terminalWidth: number) => terminalWidth > 200 ? terminalWidth / 100 * 50 : terminalWidth >= 100 ? 100 : terminalWidth;

    public confirm = (message: string, defaultValue: boolean = true): Promise<boolean> => inquirer
        .prompt([ <Question>{ name: 'confirm', type: 'confirm', message, default: defaultValue } ])
        .then((answers: any) => answers.confirm ? Promise.resolve(answers.confirm) : Promise.reject(false))
}

