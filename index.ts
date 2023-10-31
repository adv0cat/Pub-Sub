type Receiver<Args extends any[] = any[]> = (v: Args) => void;
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
      topics.get(title) || topics.set(title, topic()).get(title)!,
    unSubAll: () => topics.forEach((topic) => topic.unSubAll()),
  };
};

let queue = [] as any[];

export const topic = <Type = any[]>(): Topic<Type> => {
  const receivers = new Map<
    Subscriber<TopicArgs<Type>>,
    Receiver<TopicArgs<Type>>
  >();
  const remove = (cb: Subscriber<TopicArgs<Type>>) => receivers.delete(cb);

  return {
    pub: (...v) => {
      // run queue
      if (queue.push(v, receivers) === 2) {
        setTimeout(() => {
          for (
            let msg, queueIndex = 0;
            (msg = queue[queueIndex]);
            queueIndex += 2
          ) {
            for (const queueItem of queue[queueIndex + 1] as Map<
              Subscriber,
              Receiver
            >) {
              try {
                queueItem[1](msg);
              } catch (e) {
                console.error(e);
              }
            }
          }

          queue = [];
        }, 0);
      }
    },
    sub: (cb, ctx) => {
      receivers.set(
        cb,
        ctx != null ? (args) => cb.call(ctx, ...args) : (args) => cb(...args),
      );

      return () => remove(cb);
    },
    once: (cb, ctx) => {
      receivers.set(
        cb,
        (args) =>
          remove(cb) && (ctx != null ? cb.call(ctx, ...args) : cb(...args)),
      );

      return () => remove(cb);
    },
    unSub: (cb) => remove(cb),
    unSubAll: () => receivers.clear(),
  };
};
