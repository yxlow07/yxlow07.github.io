
import 'package:injectable/injectable.dart';
import 'package:myapp/features/auth/domain/repositories/auth_repository.dart';

@injectable
class SignOut {
  final AuthRepository repository;

  SignOut(this.repository);

  Future<void> call() {
    return repository.signOut();
  }
}
