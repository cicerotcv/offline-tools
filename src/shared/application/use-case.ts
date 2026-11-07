/**
 * One user intent. Dependencies arrive through the constructor as narrow
 * `Pick<Port, ...>` types; concrete adapters are wired in `*.factory.ts`.
 */
export abstract class UseCase<TCommand, TResult> {
  abstract execute(command: TCommand): TResult;
}
