import * as _ from 'lodash';
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
    console.log(this.roles)
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
    return matchAbilities === accesses.length;
  }

}
