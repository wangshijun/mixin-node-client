// link https://developers.mixin.one/api/beta-mixin-message/websocket-messages/
const fs = require('fs');

const types = {
  text: {
    category: 'PLAIN_TEXT',
    validate: ({ text }) => Boolean(text.toString()),
    format: ({ text }) => Buffer.from(text.toString()).toString('base64'),
  },
  image: {
    category: 'PLAIN_IMAGE',
    // TODO: support attachments
    validate: ({ image }) => Boolean(image),
    format: ({ image }) => {
      // from attachment
      if (typeof image === 'object') {
        return Buffer.from(JSON.stringify(image)).toString('base64');
      }

      // from local file
      if (fs.existsSync(image)) {
        return Buffer.from(fs.readFileSync(image)).toString('base64');
      }

      // image buffer
      return image;
    },
  },
  video: {
    category: 'PLAIN_VIDEO',
    validate: ({ video }) => Boolean(video),
    // TODO: support attachments
    format: ({ video }) => {
      // from attachment
      if (typeof video === 'object') {
        return Buffer.from(JSON.stringify(video)).toString('base64');
      }

      // from local file
      if (fs.existsSync(video)) {
        return Buffer.from(fs.readFileSync(video)).toString('base64');
      }

      // video buffer
      return video;
    },
  },
  data: {
    category: 'PLAIN_DATA',
    validate: ({ data }) => Boolean(data),
    format: ({ data }) => Buffer.from(data.toString()).toString('base64'),
  },
  sticker: {
    category: 'PLAIN_STICKER',
    validate: ({ sticker }) => sticker && sticker.name && sticker.album_id,
    format: ({ sticker }) => Buffer.from(JSON.stringify(sticker)).toString('base64'),
  },
  contact: {
    category: 'PLAIN_CONTACT',
    validate: ({ contact }) => Boolean(contact),
    format: ({ contact }) => Buffer.from(JSON.stringify({ user_id: contact })).toString('base64'),
  },
  button: {
    category: 'APP_BUTTON_GROUP',
    validate: ({ button }) => button && button.label && button.color && button.action,
    format: ({ button }) => Buffer.from(JSON.stringify([button])).toString('base64'),
  },
  buttons: {
    category: 'APP_BUTTON_GROUP',
    validate: ({ buttons }) => Array.isArray(buttons) && buttons.every(x => x.label && x.color && x.action),
    format: ({ buttons }) => Buffer.from(JSON.stringify(buttons)).toString('base64'),
  },
  app: {
    category: 'APP_CARD',
    validate: ({ app }) => app && app.icon_url && app.title && app.description && app.action,
    format: ({ app }) => Buffer.from(JSON.stringify(app)).toString('base64'),
  },
};

const createMessage = (type, args, genUUID) => {
  const spec = types[type];
  if (!spec) {
    throw new Error(`createMessage: invalid message type: ${type}`);
  }

  if (!spec.validate(args)) {
    throw new Error(`createMessage: invalid message body: ${JSON.stringify(args)}`);
  }

  return {
    id: genUUID(),
    action: 'CREATE_MESSAGE',
    params: {
      conversation_id: args.conversationId,
      category: types[type].category,
      status: 'SENT',
      message_id: genUUID(),
      data: spec.format(args),
    },
  };
};

exports.createMessage = createMessage;
exports.types = Object.freeze(types);
