
import 'package:firebase_auth/firebase_auth.dart';
import 'package:injectable/injectable.dart';
import 'package:myapp/features/auth/domain/repositories/auth_repository.dart';

@injectable
class GetAuthStateChanges {
  final AuthRepository repository;

  GetAuthStateChanges(this.repository);

  Stream<User?> call() {
    return repository.authStateChanges;
  }
}
