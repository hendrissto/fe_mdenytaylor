import * as _ from 'lodash';
import menuItems from "../../constants/menu";
import { Observable } from 'rxjs';

export class AclService {
  user = null;
  roles = [];
  hasRole(role) {
    return this.roles.includes(role);
  }

  attachRole(role) {
    const roles = _.castArray(role);
    this.roles = _.uniq(_.concat(this.roles, roles));
  }

  can(...accesses) {
    this.user = localStorage.getItem('user');
    this.roles = this.user ? JSON.parse(JSON.parse(this.user).access_permissions) : [];

    accesses = accesses.filter(_.identity);
    if (!accesses.length) {
      return true;
    }
    return _.map(accesses, accessGroup => this.canByGroup(accessGroup)).filter(_.identity).length > 0;
  }

  flushRoles() {
    this.roles = [];
  }

  canByGroup(access) {
    const abilities = this.roles;
    const accesses = _.castArray(access);

    const results = accesses.map(ability => {
      return _.includes(abilities, ability);
    });

    const matchAbilities = results.filter(_.identity).length;
    // old condition
    // return matchAbilities === accesses.length;
    return matchAbilities;
  }

  allowedMenus(data = menuItems) {
    const validMenus = [];
    _.filter(data, (menu) => {
      if(this.can(menu.permissions)) {
        if(menu.subs) {
          const validSubs = this.allowedMenus(menu.subs);
          menu.subs = validSubs;
        }
        validMenus.push(menu);
      }
    })
    return validMenus;
  }

  redirectAllowedMenu(history) {
    const validMenus = this.allowedMenus();
    if(validMenus[0]) {

      if(validMenus[0].subs) {
        history.push(validMenus[0].subs[0].to);

      } else {
        history.push(validMenus[0].to);
      }

    } else {
      history.push('/app');

    }
  }

}
