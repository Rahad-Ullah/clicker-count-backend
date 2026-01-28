import { INotification } from '../app/modules/notification/notification.interface';
import { Notification } from '../app/modules/notification/notification.model';

export const sendNotifications = async (
  data: Partial<INotification>,
): Promise<INotification> => {
  const result = await Notification.create(data);

  //@ts-ignore
  const io = global.io;

  try {
    if (io && data.receiver) {
      io.to(`user:${data.receiver.toString()}`).emit(
        'notification:new',
        result,
      );
    }
  } catch (error) {
    console.error(`Error while sending notification: ${error}`);
    io.emit('error', error);
  }

  return result;
};
