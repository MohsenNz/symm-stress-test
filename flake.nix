{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }: flake-utils.lib.eachDefaultSystem (system:
    let
      pkgs = import nixpkgs { inherit system; };
    in
    {
      devShells.default = pkgs.mkShell {
        packages = [
          pkgs.k6
          pkgs.foundry
          pkgs.nodejs_24
        ];

        shellHook = ''
          echo "🚀 You're in the symm-stress-test dev shell"
        '';
      };
    });
}
