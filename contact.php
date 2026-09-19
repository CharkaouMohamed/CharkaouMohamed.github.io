<?php
/**
 * contact.php
 * Traite le formulaire de contact du portfolio.
 *
 * IMPORTANT : ce fichier ne fonctionne QUE sur un hébergement qui exécute
 * PHP (ex : chez toi avec XAMPP/WAMP/MAMP, ou un hébergeur comme
 * InfinityFree / o2switch). GitHub Pages n'exécute PAS le PHP,
 * voir le fichier GUIDE.md pour les alternatives.
 */

header('Content-Type: application/json');

// ---- 1. On n'accepte que les requêtes envoyées en POST ----
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
    exit;
}

// ---- 2. Récupération et nettoyage des champs envoyés par le formulaire ----
$nom     = trim($_POST['nom'] ?? '');
$email   = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');

// ---- 3. Validation côté serveur (ne JAMAIS faire confiance au JavaScript seul) ----
$erreurs = [];

if (mb_strlen($nom) < 2) {
    $erreurs[] = "Le nom doit contenir au moins 2 caractères.";
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $erreurs[] = "L'adresse e-mail n'est pas valide.";
}

if (mb_strlen($message) < 10) {
    $erreurs[] = "Le message doit contenir au moins 10 caractères.";
}

if (!empty($erreurs)) {
    echo json_encode([
        'success' => false,
        'message' => implode(' ', $erreurs),
    ]);
    exit;
}

// ---- 4. Envoi de l'e-mail (ou sauvegarde locale, voir plus bas) ----
$destinataire = "ton-adresse@email.com"; // <-- remplace par ta vraie adresse
$sujet   = "Nouveau message depuis ton portfolio";
$contenu = "Nom : $nom\nEmail : $email\n\nMessage :\n$message";
$headers = "From: no-reply@tonsite.com\r\nReply-To: $email";

$succes = @mail($destinataire, $sujet, $contenu, $headers);

// La fonction mail() ne fonctionne que si le serveur est configuré pour
// envoyer des e-mails (souvent absent en local). Comme solution de secours,
// on enregistre aussi chaque message dans un fichier texte local.
$ligne = date('Y-m-d H:i:s') . " | $nom | $email | $message" . PHP_EOL;
file_put_contents(__DIR__ . '/messages.txt', $ligne, FILE_APPEND);

echo json_encode([
    'success' => true,
    'message' => "Merci $nom, ton message a bien été reçu !",
]);
