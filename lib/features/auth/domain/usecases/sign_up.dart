
import 'package:firebase_auth/firebase_auth.dart';
import 'package:injectable/injectable.dart';
import 'package:myapp/features/auth/domain/repositories/auth_repository.dart';

@injectable
class SignUp {
  final AuthRepository repository;

  SignUp(this.repository);

  Future<UserCredential> call(String email, String password) {
    return repository.signUpWithEmailAndPassword(email, password);
  }
}
