type Receiver<Args extends any[] = any[]> = (...v: Args) => void;
type TopicArgs<T> = T extends (...v: infer Args) => any
  ? Args
  : T extends any[]
  ? T
  : unknown extends T
  ? any[]
  : [T];
type TopicType<
  Topics extends object,
  Title extends string | keyof Topics,
> = Title extends keyof Topics ? Topics[Title] : any[];

export type Unsubscribe = () => boolean;
export type Subscriber<Args extends any[] = any[]> = (...v: Args) => void;

export interface Topic<Type> {
  pub(...v: TopicArgs<Type>): void;
  sub(cb: Subscriber<TopicArgs<Type>>, ctx?: object): Unsubscribe;
  once(cb: Subscriber<TopicArgs<Type>>, ctx?: object): Unsubscribe;
  unSub(cb: Subscriber<TopicArgs<Type>>): boolean;
  unSubAll(): void;
}

export interface PubSub<Topics extends object> {
  topic<Title extends keyof Topics | string>(
    title: Title,
  ): Topic<TopicType<Topics, Title>>;
  unSubAll(): void;
}

export const pubSub = <Topics extends object = {}>(): PubSub<Topics> => {
  const topics = new Map<string | keyof Topics, Topic<[]>>();
  return {
    topic: (title) =>
      topics.has(title)
        ? topics.get(title)!
        : topics.set(title, topic()).get(title)!,
    unSubAll: () => topics.forEach((topic) => topic.unSubAll()),
  };
};

export const topic = <Type = any[]>(): Topic<Type> => {
  const receivers = new Map<
    Subscriber<TopicArgs<Type>>,
    Receiver<TopicArgs<Type>>
  >();
  return {
    pub: (...v) => receivers.forEach((receiver) => receiver(...v)),
    sub: (cb, ctx) => {
      receivers.set(
        cb,
        ctx != null
          ? (...args) => cb.call(ctx, ...args)
          : (...args) => cb(...args),
      );

      return () => receivers.delete(cb);
    },
    once: (cb, ctx) => {
      receivers.set(
        cb,
        ctx != null
          ? (...args) => receivers.delete(cb) && cb.call(ctx, ...args)
          : (...args) => receivers.delete(cb) && cb(...args),
      );

      return () => receivers.delete(cb);
    },
    unSub: (cb) => receivers.delete(cb),
    unSubAll: () => receivers.clear(),
  };
};
