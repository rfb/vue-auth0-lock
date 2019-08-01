import Auth0Lock from 'auth0-lock'
import EventEmitter from 'eventemitter3'

export default class AuthService {
  constructor(clientId, domain, options) {
    this.authNotifier = new EventEmitter()
    this.auth0Lock = new Auth0Lock(clientId, domain, options)

    this.auth0Lock.on('authenticated', (authResult) => this.handleAuthentication(authResult))
    this.auth0Lock.on('authorization_error', (error) => this.handleError(error))
  }

  handleError(error) {
    console.error(error)
  }

  handleAuthentication(authResult) {
    this.auth0Lock.getUserInfo(authResult.accessToken, (error, profile) => {
      if (error) {
        console.log(error)
        return
      }

      localStorage.setItem('accessToken', authResult.accessToken)
      localStorage.setItem('expiresAt', authResult.expiresIn * 1000 + new Date().getTime())
      localStorage.setItem('idToken', authResult.idToken)
      localStorage.setItem('userProfile', JSON.stringify(profile))

      this.authNotifier.emit('authChange', {
        userProfile: profile,
        authenticated: true
      })
    })
  }

  login(options) {
    this.auth0Lock.show(options)
  }

  logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('expiresAt')
    localStorage.removeItem('idToken')
    localStorage.removeItem('userProfile')

    this.authNotifier.emit('authChange', false)
  }

  getExpiresAt() {
    return localStorage.getItem('expiresAt')
  }

  getToken() {
    return localStorage.getItem('idToken')
  }

  getUserProfile() {
    return JSON.parse(localStorage.getItem('userProfile')) || {}
  }

  isAuthenticated() {
    return new Date().getTime() < this.getExpiresAt()
  }
}