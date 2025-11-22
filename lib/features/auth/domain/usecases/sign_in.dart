
import 'package:firebase_auth/firebase_auth.dart';
import 'package:injectable/injectable.dart';
import 'package:myapp/features/auth/domain/repositories/auth_repository.dart';

@injectable
class SignIn {
  final AuthRepository repository;

  SignIn(this.repository);

  Future<UserCredential> call(String email, String password) {
    return repository.signInWithEmailAndPassword(email, password);
  }
}
