import * as _ from 'lodash';
import { Observable } from 'rxjs';

export class AclService {
  user = null;
  roles = [];
  constructor() {
    this.user = localStorage.getItem('user');
    this.roles = JSON.parse(JSON.parse(this.user).access_permissions) || [];
  }

  hasRole(role) {
    return this.roles.includes(role);
  }

  attachRole(role) {
    const roles = _.castArray(role);
    this.roles = _.uniq(_.concat(this.roles, roles));
  }

  can(...accesses) {
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
    return matchAbilities === accesses.length;
  }

}
