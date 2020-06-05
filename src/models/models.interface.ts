import { Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  password: string;
  userSecret: string;
  accessToken: string;
  accessTokenExpirationTimestamp: number;
  refreshToken: string;
  devices: IDevice[];
  rfidChips: IRfidChip[];
  rfidIsRegistering: boolean;
  comparePassword: Function;
}

export interface IDevice extends Document {
  userSecret: string;
  user: IUser;
  deviceName: string;
  sonosGroupId: string;
}

export interface IRfidChip extends Document {
  userSecret: string;
  user: IUser;
  id: string;
  sonosPlaylistId: string;
}