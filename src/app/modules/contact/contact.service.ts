import { IContact } from './contact.interface';
import { Contact } from './contact.model';

// ------------- create/update contact -------------
const createUpdateContactToDB = async (
  payload: Partial<IContact>
): Promise<IContact> => {
  // create or update contact
  const result = await Contact.findOneAndUpdate({}, payload, {
    new: true,
    upsert: true,
  });
  return result;
};

// ------------- get contact -------------
const getContactFromDB = async () => {
  const result = await Contact.findOne({});
  return result;
};

export const ContactServices = {
  createUpdateContactToDB,
  getContactFromDB,
};
