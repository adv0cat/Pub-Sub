# pub.sub

[![npm version](https://img.shields.io/npm/v/pub.sub)](https://www.npmjs.com/package/pub.sub)
[![downloads](https://img.shields.io/npm/dw/pub.sub)](https://www.npmjs.com/package/pub.sub)
[![bundle size](<https://img.shields.io/bundlejs/size/pub.sub?exports=pubSub%2Ctopic&label=bundlejs%20(gzip)>)](https://github.com/adv0cat/pub.sub)
![npm type definitions](https://img.shields.io/npm/types/pub.sub)
![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)

`pub.sub` is a type-safe topic-based Publish-Subscribe (PubSub) pattern implementation for TypeScript. Its lightweight design coupled with a simple API facilitates clean, decoupled architecture, allowing seamless communication across your application.

## Features

- ⚡ **Performance**: Efficient subscription and unsubscription with minimal overhead.
- 🧩 **Modularity**: Seamlessly define, reuse, and extend your topics and message types across your application.
- ✨ **Simple API**: Straightforward and intuitive API for publishing and subscribing to topics.
- ✅ **Type Safety**: Strongly-typed topics and messages to ensure contract adherence and catch issues at compile-time.
- 🪶 **Lightweight**: Minimal footprint on your project's bundle size.
- ♻️ **Zero Dependencies**: Standalone library with no external dependencies.

## Installation

Install `pub.sub` via npm:

```bash
npm install pub.sub --save
```

Or via yarn:

```bash
yarn add pub.sub
```

## Quick Start

```ts
// Import the pubSub function from the library
import { pubSub } from "pub.sub";

// Create a PubSub instance
const pub = pubSub();

// Define a topic for like events
const likeTopic = pub.topic("like");

// Subscribe to the like topic to log like events
const unsubscribe = likeTopic.sub((likeData) => {
  console.log(`Post ID: ${likeData.postId}, was liked!`);
});

// Simulate a like event by publishing a message to the like topic
likeTopic.pub({ postId: "abc123" });

// Optionally unsubscribe later
unsubscribe();
```

This basic flow demonstrates the core functionalities of `pub.sub`, helping you to set up a simple real-time messaging mechanism.

## Usage

### Defining Message and Topics Interfaces

In this section, we define interfaces for different types of notification events and create a PubSub instance for managing these events.

```ts
// Import the necessary functions from the library
import { pubSub } from "pub.sub";

// Define the topics interface
interface Topics {
  newContact: string;
  newMessage: (message: string, sender: string, timestamp: number) => void;
  messageDeletion: [messageId: string];
}

// Create a PubSub instance for notification events
const notifier = pubSub<Topics>();
```

### Subscribing to Topics

Here we demonstrate how to subscribe to different topics to receive and handle notification events.

```ts
// Subscribe to new message events to update UI
notifier.topic("newMessage").sub((message, sender, timestamp) => {
  console.log(
    `New message from ${sender} at ${new Date(timestamp)}: ${message}`,
  );
});

// Subscribe to new contact events to update UI
notifier.topic("newContact").sub((contactName) => {
  console.log(`New contact added: ${contactName}`);
});

// Subscribe to message deletion events to update UI
notifier.topic("messageDeletion").sub((messageId) => {
  console.log(`Message with ID ${messageId} was deleted.`);
});
```

### Publishing to Topics

In this section, we simulate user interactions by publishing realistic events to the topics.

```ts
// Simulate user interactions by publishing events
notifier
  .topic("newMessage")
  .pub("Hey, are you coming to the meeting?", "Alice", Date.now());
notifier.topic("newContact").pub("Bob Johnson");
notifier.topic("messageDeletion").pub("msg1234567890");
```

### Unsubscribing All Subscribers

You have the ability to unsubscribe all subscribers from a specific topic or from all topics in a PubSub instance using the `unSubAll` method.

```ts
// Unsubscribe all subscribers from a specific topic
notifier.topic("newMessage").unSubAll();
notifier.topic("newContact").unSubAll();
notifier.topic("messageDeletion").unSubAll();

// Unsubscribe all subscribers from all topics in the PubSub instance
notifier.unSubAll();
```

## Advanced Usage

### Creating Topics Separately

You can also create topics separately from the PubSub instance, either with or without specifying a type.

In this example, we create a topic for handling new group creation events, demonstrating how you can manage topics separately from a PubSub instance.

```ts
// Import the topic function from the library
import { topic } from "pub.sub";

// Create a topic for new group events
const groups = topic<[groupName: string]>();

// Subscribe to new group events to update UI
groups.sub((groupName) => {
  console.log(`New group created: ${groupName}`);
});

// Simulate a new group creation event by publishing to the topic
groups.pub("Project Discussion");
```

### Using Context with Subscribers

You can provide a context object when subscribing to a topic, which will be used as the `this` value when the subscriber function is called.

```ts
interface User {
    name: string;
}

const user: User = {
    name: 'Alice',
};

notifier.topic('newMessage').sub(function (message, sender, timestamp) {
    console.log(`${this.name} received a new message from ${sender} at ${new Date(timestamp)}: ${message}`);
}, user);

// Simulate user interactions by publishing events
notifier.topic('newMessage').pub('Hey, are you coming to the meeting?', 'Bob', Date.now());
```

### One-Time Subscriptions

You can create a one-time subscription to a topic using the `once` method. The subscription will be automatically removed after the first message is received.

```ts
// Subscribe to new message events for a one-time notification
notifier.topic('newMessage').once((message, sender, timestamp) => {
    console.log(`One-time notification: New message from ${sender} at ${new Date(timestamp)}: ${message}`);
});

// Simulate user interactions by publishing events
notifier.topic('newMessage').pub('Hey, are you coming to the meeting?', 'Bob', Date.now());
```

## Documentation

Currently, the documentation is being developed. However, you can find a couple of examples for each module within the library to get started. More comprehensive documentation will be provided in the near future.
