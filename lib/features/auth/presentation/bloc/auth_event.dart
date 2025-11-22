
import 'package:equatable/equatable.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object> get props => [];
}

class AuthStateChanged extends AuthEvent {
  final dynamic user;

  const AuthStateChanged(this.user);

  @override
  List<Object> get props => [user];
}

class SignOutButtonPressed extends AuthEvent {}
