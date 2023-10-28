import { describe, it, expect, jest } from "@jest/globals";
import { pubSub, topic, type Unsubscribe } from "./index";

describe("pub.sub library", () => {
  describe("pubSub function", () => {
    it("should create a new PubSub instance", () => {
      const pub = pubSub();
      expect(pub).toBeTruthy();
    });

    it("should create and retrieve the same topic on subsequent calls", () => {
      const pub = pubSub();
      const firstCall = pub.topic("test");
      const secondCall = pub.topic("test");
      expect(firstCall).toBe(secondCall);
    });
  });

  describe("pubSub instance", () => {
    it("should unsubscribe all subscribers from all topics", () => {
      const pub = pubSub();
      const testTopic1 = pub.topic("test1");
      const testTopic2 = pub.topic("test2");
      const mockSubscriber1 = jest.fn();
      const mockSubscriber2 = jest.fn();
      testTopic1.sub(mockSubscriber1);
      testTopic2.sub(mockSubscriber2);
      pub.unSubAll();
      testTopic1.pub("hello");
      testTopic2.pub("world");
      expect(mockSubscriber1).not.toHaveBeenCalled();
      expect(mockSubscriber2).not.toHaveBeenCalled();
    });
  });

  describe("Topic", () => {
    describe("Subscription and Unsubscription", () => {
      it("should allow subscription to a topic", () => {
        const testTopic = topic();
        const mockSubscriber = jest.fn();
        testTopic.sub(mockSubscriber);
        testTopic.pub("hello");
        expect(mockSubscriber).toHaveBeenCalledWith("hello");
      });

      it("should allow unsubscription using the unSub method", () => {
        const testTopic = topic();
        const mockSubscriber = jest.fn();
        testTopic.sub(mockSubscriber);
        testTopic.unSub(mockSubscriber);
        testTopic.pub("hello");
        expect(mockSubscriber).not.toHaveBeenCalled();
      });

      it("should allow unsubscription from a topic", () => {
        const testTopic = topic();
        const mockSubscriber = jest.fn();
        const unsubscribe = testTopic.sub(mockSubscriber);
        unsubscribe();
        testTopic.pub("hello");
        expect(mockSubscriber).not.toHaveBeenCalled();
      });
    });

    describe("Unsubscribing All Subscribers", () => {
      it("should unsubscribe all subscribers", () => {
        const testTopic = topic();
        const mockSubscriber1 = jest.fn();
        const mockSubscriber2 = jest.fn();
        testTopic.sub(mockSubscriber1);
        testTopic.sub(mockSubscriber2);
        testTopic.unSubAll();
        testTopic.pub("hello");
        expect(mockSubscriber1).not.toHaveBeenCalled();
        expect(mockSubscriber2).not.toHaveBeenCalled();
      });
    });

    describe("Context Binding", () => {
      it("should handle context binding correctly", () => {
        const testTopic = topic();
        const context = { value: "context" };
        const mockSubscriber = jest.fn(function (this: any) {
          expect(this.value).toBe("context");
        });
        testTopic.sub(mockSubscriber, context);
        testTopic.pub();
      });

      it("should handle context binding correctly with once", () => {
        const testTopic = topic();
        const context = { value: "context" };
        const mockSubscriber = jest.fn(function (this: any) {
          expect(this.value).toBe("context");
        });
        testTopic.once(mockSubscriber, context);
        testTopic.pub();
      });
    });

    describe("One-Time Subscription", () => {
      it("should allow one-time subscription to a topic", () => {
        const testTopic = topic();
        const mockSubscriber = jest.fn();
        testTopic.once(mockSubscriber);
        testTopic.pub("hello");
        testTopic.pub("world");
        expect(mockSubscriber).toHaveBeenCalledTimes(1);
        expect(mockSubscriber).toHaveBeenCalledWith("hello");
      });

      it("should execute unsubscribe function when subscribed with once", () => {
        const testTopic = topic();
        const mockSubscriber = jest.fn();
        const unsubscribe: Unsubscribe = testTopic.once(mockSubscriber);
        testTopic.pub("hello");
        expect(unsubscribe()).toBe(false);
      });

      it("should not call the subscriber function if unsubscribe is called before a message is published when subscribed with once", () => {
        const testTopic = topic();
        const mockSubscriber = jest.fn();
        const unsubscribe: Unsubscribe = testTopic.once(mockSubscriber);
        unsubscribe();
        testTopic.pub("hello");
        expect(mockSubscriber).not.toHaveBeenCalled();
      });
    });
  });
});
