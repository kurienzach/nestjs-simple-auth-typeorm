import { SimpleAuthTypeormModule } from "./user.module";
import { UserService } from "./user.service";
import { User } from "./user.entity";
import { IUserService, ProviderOptions } from "nestjs-simple-auth";

const UserServiceProvider: ProviderOptions<IUserService<any>> = {
  imports: [SimpleAuthTypeormModule],
  useExisting: UserService,
};

export { SimpleAuthTypeormModule, UserService, User, UserServiceProvider };
