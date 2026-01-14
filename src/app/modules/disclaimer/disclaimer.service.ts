import { IDisclaimer } from './disclaimer.interface';
import { Disclaimer } from './disclaimer.model';

// ------------- create/update disclaimer -------------
const createUpdateDisclaimerToDB = async (
  payload: Partial<IDisclaimer>
): Promise<IDisclaimer> => {
  // create or update disclaimer
  const result = await Disclaimer.findOneAndUpdate(
    { type: payload.type },
    payload,
    {
      new: true,
      upsert: true,
    }
  );
  return result;
};

// ------------- get single disclaimer by type -------------
const getSingleDisclaimerByType = async (type: string) => {
  const result = await Disclaimer.findOne({ type });
  return result;
};

export const DisclaimerServices = {
  createUpdateDisclaimerToDB,
  getSingleDisclaimerByType,
};
