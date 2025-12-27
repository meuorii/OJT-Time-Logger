import { Schema, model, models } from 'mongoose';

const AdminSchema =  new Schema ({
    username: { type: String, require: true, unique: true },
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true},
})

export const Admin = models.Admin || model('Admin', AdminSchema);