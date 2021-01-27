class GamesController < ApplicationController

    def create
        game = Game.create
        user1 = User.find_by(name:params["user1"])
        user2 = User.find_by(name:params["user2"])
        Session.create(game_id:game.id, user_id: user1.id)
        Session.create(game_id:game.id, user_id: user2.id)
        render json: game
    end

    def index
        render json: Game.all
    end

    def udpate
        # add game winner to the Game record
        # game = Game.find(params[:id])
        # game.winner = user
    end

end
